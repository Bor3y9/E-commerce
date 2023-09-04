const { Category } = require('../models/category');
const {Product}=require('../models/product');
const express = require('express');
const router = express.Router();
const mongoose=require('mongoose')

router.get(`/`, async (req, res) => { 
// list all products ( if i typed only products)
// if typed only /products i will get empty array then i have to handel it
    let filter={}
if(req.query.categories)
{
 filter={category:  req.query.categories.split(',')}
}

    const productList = await Product.find(filter).populate('category')//details of the category
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList)
})

router.get(`/:id`, async (req, res) => { // get product by id
    const product = await Product.findById(req.params.id).populate('category')
    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product)
})


router.post(`/`, async (req, res) => { // make a new product
    const category=await Category.findById(req.body.category)
    if(!category)
    return res.status(400).send('Invalid Category.')

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product=await product.save();
    if(!product)
    return res.status(500).send('The Product Cannot be created')

    res.send(product)

})

router.put('/:id',async (req,res)=>{ // edit a product by id
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product Id.')
    }
    // const category=await Category.findById(req.body.category)
    // if(!category) return res.status(400).send('Invalid Category.')

    const product=await Product.findByIdAndUpdate(
        req.params.id,
        {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        },
        {new :true}// return the new updated data
    )
    if(!product)
    return res.status(500).send('the product cannot be updated!')

    res.send(product);
    
})


router.delete('/:id',(req,res)=>{ //delete
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success:true,message:'the product is deleted'})
        }
        else{
            return res.status(404).json({success:false,message:'the product is not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false,error:err})
    })
    
})

router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        res.send({
            productCount: productCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get(`/get/featured/:count`, async (req, res) =>{ // 
    const count = req.params.count ? req.params.count : 0 // if there a count get it else return 0
    const products = await Product.find({isFeatured:true}).limit(+count)
    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
})



module.exports=router;