require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ =require("lodash");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect(process.env.DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true});
const itemSchema = new mongoose.Schema({
  item: String
});
const Item = mongoose.model("Item", itemSchema);



const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("list", listSchema);


const item1 = new Item({
  item: "Cook"
});
const item2=new Item({
  item:"Eat"
});
const item3=[item1,item2];


app.get("/create/new",function(req,res){
  res.render("new");
})

app.post("/create/new",function(req,res){
  const nnew=_.capitalize(req.body.newinput);
  List.findOne({name:nnew},function(err,docs){
    if(!err)
    {
      if(!docs)
      {
        const itemz=new List({
          name:nnew,
          items:item3
        });
        itemz.save();
        res.redirect("/existing/lists");
      }
      else{
        const u="/"+nnew;
        res.redirect(u);
      }
    }
  })

})

app.get("/", function(req, res) {

  Item.find({}, function(err, docs) {
    if (docs.length === 0) {
      Item.insertMany(item3, function(err) {
        if (err)
          {console.log(err);
          }
      });
      res.redirect("/");
    } else {
      res.render("index", {kindOfDay: "Today", lists: docs});
    }
  })
});
app.get("/:listname", function(req, res) {
  const x = _.capitalize(req.params.listname);
  List.findOne({name: x}, function(err, foundList) {
      if (!err) {
        if (!foundList) {
          const list=new List({
            name:x,
            items: item3
          });
          list.save();
          res.redirect("/" + x);
        }
       else {
        res.render("index", {
          kindOfDay: foundList.name,
          lists: foundList.items
        });
      }
    }
    })
});
app.post("/", function(req, res) {
  const newItem = req.body.newitem;
  const listName = req.body.button;
  const itemx = new Item({
    item: newItem
  });
  if (listName === "Today") {
    itemx.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundlist) {
      if (!err) {
        foundlist.items.push(itemx);
        foundlist.save();
        res.redirect("/" + listName);
      }
    });
  }
});
app.get("/existing/lists",function(req,res){
  List.countDocuments({},function(err,count){
    if(!err)
    {
      if(count===0)
      {
        res.render("error");
      }
      else
      {
        List.find({},function(err,existingList){
          res.render("try",{existing: existingList});
        })
      }
    }
  });
});
app.post("/delete", function(req, res) {
  const x = req.body.check;
  const y = req.body.listname;
  if (y === "Today") {
    Item.findByIdAndRemove(x, function(err) {
      if (!err)
        console.log(err);
        res.redirect("/");
    });

  } else {
    List.findOneAndUpdate({name: y}, {$pull: {items: {_id: x}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + y);
      }
    });
  }
})

app.post("/delete/list",function(req,res){
  const listName=req.body.check;
  List.findByIdAndDelete(listName,function(err){

      if(!err)
      res.redirect("/existing/lists");
      else
      console.log(err);
  });
});

app.listen(process.env.PORT||3000);
