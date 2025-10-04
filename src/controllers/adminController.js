const User = require('../models/User')

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('username email rote createdAt');
        res.status(200).json({success: true, count: users.length, data: users})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Server Error'})
    }
}

exports.getUserById = async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({success: false, message: 'User not found'})
        }
        res.status(200).json({success:true, data: user})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message:"Server Error"})
    }
}

exports.updateUserRole = async (req,res) => {
    try {
        const {role} = req.body;

        if(role && !['user', 'admin'].includes(role)){
            return res.status(400).json({success: false, message: 'Invalid role'})
        }

        const user = await User.findByIdAndUpdate(req.params.id, {role}, {
            new:true,
            runValidators: true
        })

        if(!user){
            return res.status(404).json({success: false, message: 'User not found'})
        }

        res.status(200).json({success: true, message: 'User role Updated successfully', data:user})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message: 'Server Error'})
        
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({success:false, message: 'User not found'})
        }

        if(user._id.toString() === req.params.id){
            return res.status(400).json({success:false, message:'Admin cannot delete their own account' })
        }
        
        await user.deleteOne();
        res.status(200).json({success: true, message: 'Deleted Successfully'})

    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message: 'Server error'})
    }
}