const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');

router.get(`/`, async (req, res) => {
    // get all users without pass
    const userList = await User.find().select('-passwordHash')

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList)
})
router.get(`/:id`, async (req, res) => {
    // get user by id
    const user = await User.findById(req.params.id).select('-passwordHash')

    if (!user) {
        res.status(500).json({
            message: 'the user with this given ID cannot be found!',
        })
    }
    res.status(200).send(user)
})

router.post('/', async (req, res) => {
    // add a user
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save()

    if (!user)
        return res.status(404).send('the user cannot be created or register!')

    res.send(user)
})

router.post('/login', async (req, res) => {
    // check if exits or not by email
    const user = await User.findOne({ email: req.body.email })
    const secret=process.env.secret
    if (!user) {
        return res.status(400).send('The User cannot be found')
    }
    //compare the password encrypted and the decrypted
    // if right i will get the token else i get password is wrong
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token= jwt.sign(
        {
            userId:user.id,
            isAdmin:user.isAdmin
        },
        secret, // various tokens
        {expiresIn:'1d'} // logout after 1 day ( token expires)

    )

        res.status(200).send({user:user.email,token:token})
    } else {
        res.status(400).send('Password is wrong')
    }
})
router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})
router.get(`/get/count`, async (req, res) => { // count number of users
    try {
        const userCount = await User.countDocuments();
        res.send({
            userCount: userCount
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/:id',(req,res)=>{ //delete
    User.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success:true,message:'the user is deleted'})
        }
        else{
            return res.status(404).json({success:false,message:'the user is not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false,error:err})
    })
    
})


module.exports = router
