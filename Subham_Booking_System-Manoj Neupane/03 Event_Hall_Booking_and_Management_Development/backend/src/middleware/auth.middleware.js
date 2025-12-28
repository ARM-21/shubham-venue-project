import User from "../models/User.js";


export async function isAuthenticated(req, res, next) {
    try {
        const userId = req.session?.userId;
        // to check if session also exists in server
        if (!userId) return res.status(401).json({ message: "Not authenticated" });

        const doesUserExist = await User.findById(userId);
        if (!doesUserExist) return res.status(401).json({ message: "User not found" });
        const user = await User.findById(userId).select("-password");
        req.currentUser = user;
        next()
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function isAdmin(req, res, next) {
    try {
        if (!req.currentUser) return res.status(401).json({ message: "Not authenticated" });
        if (req.currentUser.role != "Admin") return res.status(401).json({ message: "Access Forbidden" })
        next()
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
}
