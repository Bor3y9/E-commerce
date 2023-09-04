const {Category}=require('../models/category');
const express=require('express');
const router=express.Router();


router.get(`/`, async(req,res)=>{ //get all categories
    const categoryList= await Category.find();

    if(!categoryList){
        res.status(500).json({success:false})
    }
    res.status(200).send(categoryList);

})


router.get(`/:id`, async(req,res)=>{ // get category by id
    const category= await Category.findById(req.params.id);

    if(!category){
        res.status(500).json({message:'the category with this given ID cannot be found!'})
    }
    res.status(200).send(category);
})


router.post('/',async(req,res)=>{ // add a category
    let category=new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color
    })
    category=await category.save();
    if(!category)
    return res.status(404).send('the category cannot be created')

    res.send(category);

})


router.put('/:id',async (req,res)=>{ // edit a category by id
    const category=await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        },
        {new :true}// return the new updated data
    )
    if(!category)
    return res.status(404).send('the category cannot be updated!')

    res.send(category);
    
})


// api/v1/[id i want to delete]
router.delete('/:id',(req,res)=>{
    Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category){
            return res.status(200).json({success:true,message:'the category is deleted'})
        }
        else{
            return res.status(404).json({success:false,message:'the category is not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false,error:err})
    })
    
})

module.exports=router;