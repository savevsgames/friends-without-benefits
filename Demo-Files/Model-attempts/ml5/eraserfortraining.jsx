import React, { useState, useEffect } from 'react';

const ML5Training = () => {
  const [featureExtractor, setFeatureExtractor] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [status, setStatus] = useState('Loading model...');
  const [loss, setLoss] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [counts, setCounts] = useState({
    headphones: 0,
    toothbrush: 0,
    fork: 0,
    remote: 0,
    mug: 0
  });

  useEffect(() => {
    let checkML5Interval;
    
const initializeML5 = async () => {
    if (window.ml5) {
      try {
        const options = {
          version: 1,
          epochs: 100,
          learningRate: 0.001,
          batchSize: 16,
          patience: 10,
          numLabels: 5
        };
        
        const featureExt = window.ml5.featureExtractor('MobileNet', options);
        
        await featureExt.load('model.json');
        setStatus('Existing model loaded! You can add more training data.');
        
        setFeatureExtractor(featureExt);
        setClassifier(featureExt.classification());
      } catch (error) {
        console.error('Error loading existing model:', error);
        setStatus('Starting with fresh model since existing model could not be loaded.');
        
        const featureExt = window.ml5.featureExtractor('MobileNet', options, () => {
          setStatus('Ready to add images!');
        });
        
        setFeatureExtractor(featureExt);
        setClassifier(featureExt.classification());
      }
    }
  };

    initializeML5();

    if (!window.ml5) {
      checkML5Interval = setInterval(initializeML5, 100);
    }

    return () => {
      if (checkML5Interval) clearInterval(checkML5Interval);
    };
  }, []);

  const forceGarbageCollection = async () => {
    setStatus('Clearing memory...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (window.gc) {
      window.gc();
    }
  };

  const processImageBatch = async (images, label, startIdx, batchSize) => {
    const endIdx = Math.min(startIdx + batchSize, images.length);
    const batch = images.slice(startIdx, endIdx);
    
    try {
      for (const file of batch) {
        if (file.type.startsWith('image/')) {
          await new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
              try {
              
                const maxSize = 300; 
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                  if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                  }
                } else {
                  if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const resizedImg = new Image();
                resizedImg.onload = () => {
                  classifier.addImage(resizedImg, label, () => {
                    URL.revokeObjectURL(img.src);
                    resizedImg.src = '';
                    canvas.width = 1;
                    canvas.height = 1;
                    resolve();
                  });
                };
                resizedImg.src = canvas.toDataURL('image/jpeg', 0.8);
                
                URL.revokeObjectURL(img.src);
                img.src = '';
              } catch (error) {
                URL.revokeObjectURL(img.src);
                img.src = '';
                reject(error);
              }
            };

            img.onerror = () => {
              URL.revokeObjectURL(img.src);
              img.src = '';
              reject(new Error('Failed to load image'));
            };

            img.src = URL.createObjectURL(file);
          });

          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setStatus(`Processed ${endIdx} of ${images.length} ${label} images...`);

      if (endIdx < images.length) {
        await forceGarbageCollection();
        await new Promise(resolve => setTimeout(resolve, 500));
        await processImageBatch(images, label, endIdx, batchSize);
      }
    } catch (error) {
      console.error('Error in batch:', error);
      throw error;
    }
};

  const handleImageUpload = async (label, files) => {
    try {
      await forceGarbageCollection();
      const fileArray = Array.from(files);
      
      if (fileArray.length > 30) {
        setStatus('Warning: Large batch detected. Processing may be slower to prevent memory issues.');
      }
      
      const currentCount = counts[label];
      setStatus(`Starting to process ${fileArray.length} images for ${label}...`);
      
      setCounts(prev => ({
        ...prev,
        [label]: currentCount + fileArray.length
      }));

      await processImageBatch(fileArray, label, 0, 5);
      await forceGarbageCollection();
      
      setStatus(`Successfully added ${fileArray.length} images for ${label}. Total count: ${currentCount + fileArray.length}. Wait 5 seconds before next upload.`);
    } catch (error) {
      console.error('Error processing images:', error);
      setStatus(`Error processing images for ${label}. Try uploading fewer images at once (20-30 maximum).`);
      
      setCounts(prev => ({
        ...prev,
        [label]: currentCount
      }));
    }
  };

const trainModel = () => {
    setIsTraining(true);
    setStatus('Training started... This may take several minutes. Please wait.');

    let epochCount = 0;
    classifier.train((lossValue) => {
      if (lossValue === null || lossValue === undefined) {
        setStatus('🎉 Training complete! You can now save your model.');
        setIsTraining(false);
        setIsModelTrained(true);
        return;
      }

      try {
       
        const numericLoss = typeof lossValue === 'number' ? lossValue : Number(lossValue);
        
        if (!isNaN(numericLoss)) {
          epochCount++;
          setLoss(numericLoss);
          setStatus(`Training in progress... Epoch ${epochCount}/100 (Loss: ${numericLoss.toFixed(4)})`);
        } else {
          console.warn('Received invalid loss value:', lossValue);
          setStatus(`Training in progress... Epoch ${epochCount}/100`);
        }
      } catch (error) {
        console.error('Error processing loss value:', error);
        setStatus(`Training in progress... Epoch ${epochCount}/100`);
      }
    });
};

const saveModel = () => {
    setStatus('Saving model...');
    
    const metadata = {
      labels: ['headphones', 'toothbrush', 'fork', 'remote', 'mug'],
      modelName: 'custom-image-classifier',
      timeStamp: new Date().toISOString(),
      modelSettings: {
        epochs: 100,
        numLabels: 5
      }
    };
  
    featureExtractor.save((err) => {
      if (err) {
        console.error(err);
        setStatus('Error saving model');
      } else {
 
        const element = document.createElement('a');
        const metadata_file = new Blob([JSON.stringify(metadata)], {type: 'text/json'});
        element.href = URL.createObjectURL(metadata_file);
        element.download = 'model_meta.json';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        setStatus('Model and metadata saved successfully!');
      }
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Train Custom Image Classifier</h1>
      
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px',
        backgroundColor: isModelTrained ? '#d4edda' : '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        {status}
        {loss && isTraining && <div>Current Loss: {loss.toFixed(4)}</div>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        {Object.keys(counts).map((label) => (
          <div key={label} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd' }}>
            <h3>{label} Images: {counts[label]}</h3>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(label, e.target.files)}
              disabled={isTraining}
            />
          </div>
        ))}
      </div>

      <div>
        <button 
          onClick={trainModel} 
          disabled={isTraining || isModelTrained}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: isTraining ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isTraining ? 'not-allowed' : 'pointer'
          }}
        >
          {isTraining ? 'Training in Progress...' : 'Train Model'}
        </button>

        <button 
          onClick={saveModel} 
          disabled={!isModelTrained}
          style={{
            padding: '10px 20px',
            backgroundColor: isModelTrained ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isModelTrained ? 'pointer' : 'not-allowed'
          }}
        >
          Save Model
        </button>
      </div>
    </div>
  );
};

export default ML5Training;