import { registerLocalUser, loginLocalUser } from "../../services/auth/auth.service.js";
import { httpError } from "../../utils/http.utils.js";
import { success } from "../../utils/http.utils.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw httpError(400, "Email and password are required");

    const created = await registerLocalUser({ email, password });
    return success(res, {}, `User ${created.username} created with ${created.email}`, 201);
  } catch (err) {
    return next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw httpError(400, "Email and password are required");

    const user = await loginLocalUser({ email, password });

    if (req.session.userId != user._id) {
      req.session.userId = user._id;
      req.session.role = user.role;
      req.session.save();
    }

  return success(res,  {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        profilePicture: user.profilePicture,
        username: user.username,
      }, "Login successful", 200);

  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return next(httpError(500, "Could not log out user"));
      res.clearCookie("sid");
       return success(res, {}, "User logged out", 200);
    });
  } catch (err) {
    return next(err);
  }
};