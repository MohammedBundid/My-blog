const express = require('express')
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const JwtSecret = process.env.SECRET;


const adminLayout = '../views/layouts/admin';



const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json( { message: "unauthorized" } );
    }

    try {
        const decoded = Jwt.verify(token, JwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch(error){
        res.status(401).json( { message: "unauthorized" } );
    }
}



// GET home
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: 'Admin',
            description: "a blog site made using nodejs"
        }

        res.render('admin/index', { locals, layout: adminLayout })
    }
    catch (error){
        console.log(error); 
    } 
})

// admin login
router.post('/admin', async (req, res) => {
    try {
        const { username, password} = req.body;
        
        const user = await User.findOne( { username });

        if(!user){
            return res.status(401).json( { message: "invalid credentials"} );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json( { message: "invalid credentials"} );
        }

        const token = Jwt.sign({ userId: user._id}, JwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');


    } 
    catch(error) {
        console.log(error);
    }
})

// admin dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Admin',
            description: "a blog site made using nodejs"
        }

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout 
        })
    }
    catch(error){
        console.log(error)
    }

})

// GET 
// admin new post

router.get('/add-post', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Add post',
            description: "a blog site made using nodejs"
        }

        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            data,
            layout: adminLayout 
        })
    }
    catch(error){
        console.log(error)
    }

})

// POST
// admin new post

router.post('/add-post', authMiddleware, async (req, res) => {

    try {

        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            })

            await Post.create(newPost);
            res.redirect('/dashboard')

        }
        catch(error) {
            console.log(error)
        }
        
    }
    catch(error){
        console.log(error)
    }

})

// get single post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Edit post',
            description: "a blog site made using nodejs"
        }

        const data = await Post.findOne({ _id: req.params.id });

        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout 
        })
    }
    catch(error){
        console.log(error)
    }

})

// PUT
// admin edit post

router.put('/edit-post/:id', authMiddleware, async (req, res) => {

    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        
        res.redirect(`/edit-post/${req.params.id}`)
    }
    catch(error){
        console.log(error)
    }

})

// DELETE
// admin delete post

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {

        await Post.deleteOne({ _id: req.params.id })
        
        res.redirect('/dashboard')
    }
    catch(error){
        console.log(error)
    }

})

// GET
// admin logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    // res.json({ message: 'logout successful'});
    res.redirect('/');
})



// admin login old
// router.post('/admin', async (req, res) => {
//     try {
//         const { username, password} = req.body;
//         console.log(req.body);
//         res.redirect('/admin');
//     } 
//     catch(error) {
//         console.log(error);
//     }
// })

// admin register

// router.post('/register', async (req, res) => {
//     try {
//         const { username, password} = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10);

//         try {
//             const user = await User.create({ username, password:hashedPassword });
//             res.status(201).json({ message: "user Created", user });
//         }
//         catch(error){
//             if(error.code === 11000) {
//                 res.status(409).json({ message: "user already in use" });
//             }
//             res.status(500).json({ message: "internal server error" });
//         }
//     } 
//     catch(error) {
//         console.log(error);
//     }
// })

module.exports = router