const {Order}=require('../models/order');
const express=require('express');
const { OrderItem } = require('../models/order-item');
const router=express.Router();


router.get(`/`, async(req,res)=>{// sort from newest to oldest and get info of name
    const orderList= await Order.find()
    .populate('user','name')
    .sort({'dateOrdered':-1});

    if(!orderList){
        res.status(500).json({success:false})
    }
    res.send(orderList);

})

router.get(`/:id`, async(req,res)=>{// sort from newest to oldest and get info of name
    const order= await Order
    .findById(req.params.id)
    .populate('user','name')
    //populate an array of order items ( category , product)
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'}
        })

    if(!order){
        res.status(500).json({success:false})
    }
    res.send(order);

})

router.post('/',async(req,res)=>{ // add a order
    // i have to combine because its returns a promise
    // and its an array , so we use promise.all to return all orders list
    const OrderItemsIds=Promise.all(req.body.orderItems.map(async orderItem=>{
        let newOrderItem= new OrderItem({
            quantity: orderItem.quantity,
            product:orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;

    }))
    const orderItemsIdsResolved=await OrderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))
    const totalPrice = totalPrices.reduce((a,b) => a +b , 0);
    console.log(totalPrice);


    let order=new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order=await order.save();
    if(!order)
    return res.status(404).send('the order cannot be created')

    res.send(order);

})
router.put('/:id',async (req,res)=>{ // edit a status only by id
    const order=await Order.findByIdAndUpdate(
        req.params.id,
        {
            status:req.body.status
        },
        {new :true}// return the new updated data
    )
    if(!order)
    return res.status(404).send('the order cannot be updated!')

    res.send(order);
    
})

router.delete('/:id', (req, res)=>{ //delete the order
    //and the order items
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
    
})

router.get('/get/totalsales',async(req,res)=>{
    const totalSales=await Order.aggregate([
        {$group: {_id:null,totalSales:{$sum:'$totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(400).send('The Order Sales cannot be generated')
    }
    //res.send({totalSales:totalSales}) get only total sales form array
    res.send({totalSales:totalSales.pop().totalSales})
})

router.get(`/get/count`, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        res.send({
            orderCount: orderCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// get user orders by id
router.get(`/get/userorders/:userid`, async(req,res)=>{// sort from newest to oldest and get info of name
    const userOrderList= await Order.find({user:req.params.userid})
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'}
        })
    .sort({'dateOrdered':-1});

    if(!userOrderList){
        res.status(500).json({success:false})
    }
    res.send(userOrderList);

})



module.exports=router;