const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require('express-session');
const connection = require('./database/connection')
const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');
const usersController = require('./users/UsersController');
const Category = require('./categories/Category');
const Article = require('./articles/Article');
const User = require('./users/User');



app.set("view engine", "ejs");


app.use(session({
    secret: 'coisaqualquer', cookie: {maxAge: 300000}
}));

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

connection.authenticate()
    .then(()=>{
        console.log('Servidor rodando com sucesso');
    }).catch((error)=>{
        console.log(error);
    })


app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', usersController);

app.get('/', (req,res)=>{
    Article.findAll({
        order:[
            ['id', 'DESC']
        ],
        limit: 9
    }).then(articles =>{
        Category.findAll().then(categories=>{
            res.render("index",{articles:articles, categories:categories});
        })
    })
});

app.get('/:slug',(req,res)=>{
    var slug = req.params.slug;
    Article.findOne({
        where:{
            slug: slug
        }
    }).then(article=>{
        if(article != undefined){
            Category.findAll().then(categories=>{
                res.render("article",{article:article, categories:categories});
            })
        }else{
            res.redirect('/')
        }
    }).catch(err=>{
        res.redirect('/')
    })
})

app.get('/category/:slug',(req,res)=>{
    var slug = req.params.slug;

    Category.findOne({
        where:
        {
            slug:slug
        },
        include: [{model: Article}]
    }).then(category=>{
        if(category != undefined){
            Category.findAll().then(categories=>{
                res.render('index',{categories:categories, articles: category.articles})
            })
        }else{
            res.redirect('/')
        }
    })
})

app.listen(8080,()=>{
    console.log('O servidor esta rodando')
});