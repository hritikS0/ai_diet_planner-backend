import { User } from "../models/user.model.js";
import bycrpt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
export const userRegister = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const storedEmail = await User.findOne({ email });
    if (storedEmail)
      return res.status(400).json({ message: "User already exists!" });

    const hashedPassword = await bycrpt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    return res.status(200).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Enable to register User", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { name, password, email } = req.body;
     if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "user not found" });

    const isMatch = await bycrpt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Passsword did not match" });

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
