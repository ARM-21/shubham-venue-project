import User from "../models/User.js";

export async function isAuthenticated(req, res, next) {
    try {
        const userId = req.session?.userId;
        // to check if session also exists in server
        if (!userId) return res.status(401).json({ message: "Not authenticated" });

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(401).json({ message: "User not found" });
        if (user.isActive === false) {
            req.session?.destroy?.(() => {});
            const cookieName = process.env.SESSION_NAME || "sid";
            res.clearCookie(cookieName, {
                path: "/",
                domain: process.env.NODE_ENV === "production" ? ".shubham-venue.me" : undefined,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });
            return res.status(403).json({ message: "Account disabled" });
        }
        // Single-session enforcement — reject sessions that were superseded by a newer login
        if (user.currentSessionId && req.session.id !== user.currentSessionId) {
            req.session?.destroy?.(() => {});
            return res.status(401).json({ message: "Signed in from another device. Please log in again.", code: "SESSION_SUPERSEDED" });
        }
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
        if ((req.currentUser.role || "").toLowerCase() !== "admin") return res.status(401).json({ message: "Access Forbidden" })
        next()
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function isOrganizer(req, res, next) {
    try {
        if (!req.currentUser) return res.status(401).json({ message: "Not authenticated" });
        const role = (req.currentUser.role || "").toLowerCase();
        if (role === "admin") return next();
        if (!req.currentUser.isOrganizerEligible) {
            return res.status(403).json({ message: "Organizer access required" });
        }
        next();
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
}
