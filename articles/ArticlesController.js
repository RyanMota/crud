const express = require('express');
const slugify = require('slugify');
const router = express.Router();
const Article = require('./Article')
const Category = require('../categories/Category');
const upload = require('../multer/upload');
const adminAuth = require('../middlewares/adminAuth');
 

router.get('/admin/articles', adminAuth,(req,res)=>{
    Article.findAll({
        include: [{model: Category, required:true}]
    }).then(articles=>{
        res.render('admin/articles/index',{articles:articles});
    })
})
router.get('/admin/articles/new',adminAuth,(req,res)=>{
    Category.findAll().then((categories)=>{
        res.render('admin/articles/new',{categories:categories});
    })
})
router.post('/articles/save',adminAuth,  upload.single('image'), async (req,res)=>{
    var title = req.body.title;
    var body = req.body.body;
    var categoryId = req.body.categoryId;
    var description = req.body.description;
    var image = req.file.filename;
    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        description: description,
        image: image,
        categoryId: categoryId,
    }).then(()=>{
        console.log(image);
        res.redirect('/admin/articles')
    })
})

router.post('/articles/delete',adminAuth,(req,res)=>{
    var id = req.body.id;
    if(!isNaN(id)){
        if(id != undefined){
            Article.destroy({
                where:{
                    id:id
                }
            }).then(()=>{
                res.redirect('/admin/articles')
            })
        }else{
            res.redirect('/admin/articles')
        }
    }else{
        res.redirect('/admin/articles')
    }
})

router.get('/articles/edit/:id',adminAuth,(req,res)=>{
    var id = req.params.id;
    if(id != undefined){
        if(!isNaN(id)){
            Article.findByPk(id).then(article=>{
                Category.findAll().then(categories=>{
                    res.render('admin/articles/edit',{article:article, categories:categories})
                })
            })
        }else{
            res.redirect('/admin/articles')
        }
    }else[
        res.redirect('/admin/articles')
    ]
})

router.post('/articles/update',adminAuth,(req,res)=>{
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var description = req.body.description;
    var categoryId = req.body.categoryId;
    Article.update({title: title, slug: slugify(title) ,body:body, description: description,  categoryId: categoryId },{
        where:{
            id : id
        }}).then(()=>{
            res.redirect('/admin/articles')
        }).catch(err=>{
            console.log(err);
            res.redirect('/');
        });

    })
router.get("/articles/page/:num",(req,res)=>{
    var page = req.params.num;
    var offset = 0;

    if(isNaN(page) || page == 1){
        offset = 0
    }else{
        offset = (parseInt(page)-1) * 9
    }
    Article.findAndCountAll({
        limit:9,
        offset: offset,
        order:[
            ['id', 'DESC']
        ],
    }).then(articles=>{

        var next;
        if(offset + 9 >= articles.count){
            next: false;
        }else{
            next: true;
        }

        var result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }

        Category.findAll().then(categories=>{
            res.render('admin/articles/page',{result:result, categories:categories})
        })

    })
})


module.exports = router;