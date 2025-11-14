import User from "../models/User.js";
export const registerUser = async (req, res) => {
    console.log("registration started")
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }
        const username = email.split("@")[0]
        const newUser = new User({
            username,
            email,
            password,
        });

        await newUser.save();
        res.status(201).json({ message: `User ${username} created with ${email}` });

    } catch (err) {
        console.error("Registration Error:", err.errorResponse.errInfo.details);
        res.status(500).json({ message: "Error Occurred! Try Again Later" });
    }
}
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for required fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (req.session.userId != user._id) {
            console.log("user is not connected.. connecting to a session")
            req.session.userId = user._id;
            req.session.role = user.role;
            req.session.save()
        }
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error. Please try again later.", error: err });
    }
}

export const logout = async (req, res) => {

    try{
        req.session.destroy()
    res.clearCookie("connect.sid")
    res.status(200).json({message:"User Logged Out"})
    }
    catch(err){
        res.status(501).json({message:"Error occured! Try Again"})
    }
}