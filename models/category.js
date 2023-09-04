const mongoose=require('mongoose');


const categorySchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    icon:{
        type:String,
    },
    color:{ //#000 ..black
        type:String,
    }
});


categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});



exports.Category=mongoose.model('Category',categorySchema);