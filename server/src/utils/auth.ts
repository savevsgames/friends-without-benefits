import jwt from "jsonwebtoken"

export const authenticateToken = ({ req }: any) => {
// check what format the token is 
    let token = req.body.token || req.headers.authorization || req.query.token;
     if (req.headers.authorization) {
        token = token.split('').pop().trim();
     }
// if no token is provided return the req
     if (!token) {
        return req;
     }
// verify token
     try {
        const { data }: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '', { maxAge: '1hr'});
        // if the token is valid, attach the user data to the req object
        req.user = data;
     } catch (err) {
        console.log("woopsy! Invalid token")
     };

     return req;
}

export const signToken = (username: string, email: string, _id: unknown) => {
// create a payload with the user's info
    const payload = {username, email, _id};
    const secretKey: any = process.env.JWT_SECRET_KEY

    // sign the token with the payload
    return jwt.sign({ data: payload}, secretKey, { expiresIn: '1h'})
}