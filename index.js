import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const app=express();
const port=3000;
const __dirname=dirname(fileURLToPath(import.meta.url));
const api_key_ott = process.env.API_KEY_OTT;
const api_key_movieverse = process.env.API_KEY_MOVIEVERSE;

app.use("/public",express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended:true}));

//Signup
app.get("/",(req,res)=>{
    res.render(__dirname+"/signup.ejs");
});

//Home 
app.get("/home",(req,res)=>{
    res.render(__dirname+"/home.ejs");
});

app.post("/home",(req,res)=>{
    res.render(__dirname+"/home.ejs");
});

app.post("/search",async (req,res)=>{
    try{
        const response=await axios({
            method:'GET', 
            url: 'https://ott-details.p.rapidapi.com/advancedsearch',
            params : {
                start_year:req.body.start_year,
                end_year:req.body.end_year,
                min_imdb:req.body.min_imdb,
                max_imdb:req.body.max_imdb,
                genre: req.body.genre,
                language: req.body.language,
                type: 'movie',
                sort: 'latest',
            },
            headers: {
                'X-RapidAPI-Key': api_key_ott,
                'X-RapidAPI-Host': 'ott-details.p.rapidapi.com'
            }
        });
        var data=response.data.results; //list of js objects
        res.render(__dirname+"/home.ejs",{content:data});
        }catch(error){
        console.log(error.data);
        res.render(__dirname+"/home.ejs",{error:"Sorry!! Data not found"});
    }
});

app.get("/upcom-movies",async(req,res)=>{
    res.render(__dirname+"/upcoming-movies.ejs");
});

app.post("/upcom-search",async(req,res)=>{
    try{
        const response=await axios({
            method: 'GET',
            url: 'https://moviesverse1.p.rapidapi.com/upcoming-movies',
            headers: {
                      'X-RapidAPI-Key': api_key_movieverse,
                    'X-RapidAPI-Host': 'moviesverse1.p.rapidapi.com'
                     }
            });
        var data=response.data.movies;
        var k=0, movies=[];

        //reshaping the API response
        for(var i=0;i<data.length;i++){
            for(var j=0;j<data[i].list.length;j++){
                movies[k]={date:data[i].date}
                movies[k]["title"]=data[i].list[j].title;
                movies[k]["poster"]=data[i].list[j].image;
                k=k+1;
            }
        }
        var filt_date=req.body.month+" "+req.body.day+", "+req.body.year;
        var day=req.body.day;
        var m=0;
        // Split the string by comma
        var parts = day.split(',');
        // Extract the day part
        var dayPart = parts[0].split(' ')[1];
        var j=0, checker=0, sorted=[];//checker is to check whether the sorted array is having at least one js object
        for(var i=0;i<movies.length;i++){
            var title=movies[i].title.split(" ");
            var name=(title.slice(0,title.length-1)).join(" ");
            if(name===req.body.search || movies[i].date===filt_date){
                sorted[j++]=movies[i];
                checker++;
            }
            else if(movies[i].date.split(" ")[0]===req.body.month && dayPart===req.body.day){
                sorted[j++]=movies[i];
                checker++;
            }
            else if(dayPart===req.body.day && movies[i].date.split(" ")[2]===req.body.year){
                sorted[j++]=movies[i];
                checker++;
            }
            else if(movies[i].date.split(" ")[0]===req.body.month && movies[i].date.split(" ")[2]===req.body.year){
                sorted[j++]=movies[i];
                checker++;
            }
            else if(movies[i].date.split(" ")[0]===req.body.month || dayPart===req.body.day || movies[i].date.split(" ")[2]===req.body.year){
                sorted[j++]=movies[i];
                checker++;
            }
            else{
                m=1;
            }
        }
        res.render(__dirname+"/upcoming-movies.ejs",{content:sorted,message:m});
    }catch(error){
        console.log(error.data);
        res.render(__dirname+"/upcoming-movies.ejs",{error:"Sorry!! Data not found"})
    }
});

app.get("/trending-trailers",async(req,res)=>{
    try{
        const response=await axios({
            method: 'GET',
            url: 'https://moviesverse1.p.rapidapi.com/get-trending-trailers',
            headers: {
                      'X-RapidAPI-Key': api_key_movieverse,
                      'X-RapidAPI-Host': 'moviesverse1.p.rapidapi.com'
                     }
            });
        var data=JSON.stringify(response.data.trailers);
        res.render(__dirname+"/trend-trailers.ejs",{content:data});
    }catch(error){
        console.log(error.data);
        res.render(__dirname+"/news.ejs",{error:"Sorry!! Data not found"});
    }
});
app.get("/news",async (req,res)=>{
    try{
        const response=await axios({
            method: 'GET',
            url: 'https://moviesverse1.p.rapidapi.com/get-movie-news',
            headers: {
                      'X-RapidAPI-Key': api_key_movieverse,
                      'X-RapidAPI-Host': 'moviesverse1.p.rapidapi.com'
                     }
            });
        var data=JSON.stringify(response.data.news);
        res.render(__dirname+"/news.ejs",{content:data});
    }catch(error){
        console.log(error.data);
        res.render(__dirname+"/news.ejs",{error:"Sorry!! Data not found"});
    }
});


app.get("/about",(req,res)=>{
    res.render(__dirname+"/about.ejs");
});

app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});

