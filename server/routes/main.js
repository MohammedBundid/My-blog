const express = require('express')
const router = express.Router();
const Post = require('../models/Post');

// GET
router.get('', async (req, res) => {
    try {
        const locals = {
            title: 'myblog',
            description: 'a blog site made using nodejs'
        }

        let perPage = 5;
        let page = req.query.page || 1;
    
        const data = await Post.aggregate([ { $sort: { createdAt: -1 } }])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);


        res.render('index.ejs', {
            locals, 
            data ,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        
        });
    }

    catch(error) {
        console.log(error);
    }
 

})


// get single post by id / post:id
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;

        const data = await Post.findById( { _id: slug });

        const locals = {
            title: data.title,
            description: "a blog site made using nodejs"
        }

        res.render('post', { locals, data, currentRoute: `/post/${slug}`})
    }
    catch (error){
        console.log(error);
    }
})

 

// search for a post
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: 'search',
            description: "a blog site made using nodejs"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
            ]
        });

        res.render("search", {
            data,
            locals
        });
    }
    catch (error){
        console.log(error);
    }
})

 
router.get('/about', (req, res) => {
    const locals = {
        title: 'myblog',
        description: 'a blog site made using nodejs'
    }

    res.render('about', {
        locals,
        currentRoute: '/about'
    })
})

router.get('/contact', (req, res) => {
    const locals = {
        title: 'about me',
        description: 'a blog site made using nodejs'
    }

    res.render('contact', {
        locals,
        currentRoute: '/contact'
    })
})







module.exports = router