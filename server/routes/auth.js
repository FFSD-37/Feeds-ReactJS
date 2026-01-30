import express from 'express';
import Admin from '../models/admin.js';
import { create_JWTtoken } from 'cookie-string-parser';

const auth = express.Router();

auth.post("/login", async (req, res) => {
    if (req.body){
        const { username, password } = req.body;
        try{
            const user = await Admin.findOne({username: username});
            console.log(user);
            if(!user){
                return res.status(401).json({
                    success: false,
                    msg: "Invalid credentials"
                });
            }
            if (user.password !== password){
                return res.status(401).json({
                    success: false,
                    msg: "Invalid credentials"
                });
            }
            
            // Create JWT token with consistent structure
            // [username, identifier, image/email, role, isPremium/isActive]
            const token = create_JWTtoken(
                [username, user.email || '', '', 'Admin', true],
                process.env.USER_SECRET,
                '30d'
            );
            
            // Set cookie
            res.cookie('uuid', token, { 
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            
            return res.status(200).json({
                success: true,
                msg: "Successfully logged in",
                user: {
                    username: user.username,
                    email: user.email
                }
            });
        } catch (e){
            return res.status(400).json({
                success: false,
                msg: "Error while fetching admin from mongoDB"
            });
        }
    } else{
        return res.status(401).json({
            success: false,
            msg: "Required fields are missing"
        });
    }
});

auth.post("/logout", (req, res) => {
    res.cookie('uuid', '', { maxAge: 1 });
    res.cookie('cuid', '', { maxAge: 1 });
    
    return res.status(200).json({
        success: true,
        msg: "Successfully logged out"
    });
});

export default auth;
