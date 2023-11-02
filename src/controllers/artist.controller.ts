import secrets from "@/config/secrets";
import Artist from "@/models/users/artist.model";
import { sendSMS, verifyOTP } from "@/services/twilio.services";
import { UserStatus } from "@/typings/enums";
import cookieToken from "@/utils/cookie-token";
import toIND from "@/utils/to-ind";
import { NextFunction, Request, Response } from "express";
import Play from "@/models/play.model";
import User from "@/models/users/user.model";


type P = {
  rq: Request;
  rs: Response;
  n: NextFunction;
};

/**
 * Find All artist
 * @param req
 * @param res
 * @param next
 */

export const getAllartists = async (req: P["rq"], res: P["rs"]) => {
  try {
    const artist = await Artist.find();
    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Find artist by ID
 * @param req
 * @param res
 * @param next
 */
export const getartistByName = async (req: P["rq"], res: P["rs"]) => {
  try {
    const name = req.params;
    const artist = await Artist.find(name);
    console.log(artist);
    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json("user not found");
  }
};
/**
 * Delete artist by ID
 * @param req
 * @param res
 * @param next
 */
export const deleteartistById = async (req: P["rq"], res: P["rs"]) => {
  try {
    const artist = await Artist.deleteOne({ _id: req.params.artist_id });
    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Sign Up artist
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const signUp = async (req: P["rq"], res: P["rs"], next: P["n"]) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.json("Required");
  }
  try {
    /**
     * For Sending OTP to the artist phone
     */
    const india = toIND(phone);
    await sendSMS(india);
    const artist = await Artist.create({
      name,
      phone,
      password,
    });
    await cookieToken<typeof artist>(artist, res);
    res.status(200).json(artist);
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Confirm OTP
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const confirmOTP = async (req: P["rq"], res: P["rs"], next: P["n"]) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.json("OTP is required");
  }
  try {
    const india = toIND(phone);
    const response = await verifyOTP(india, otp);
    if (response.status === UserStatus.APPROVED) {
      const artist = await Artist.findOneAndUpdate(
        { phone },
        { status: UserStatus.APPROVED },
        { new: true }
      );

      artist.save();
      res.status(200).json(artist);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
/**
 * Sign In artist
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const signIn = async (req: P["rq"], res: P["rs"], next: P["n"]) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.json("Phone Number and password Required ");
  }
  const artist = await Artist.findOne({ phone }).select("+password");
  console.log({ artist });
  if (!artist) {
    return res.json("Phone Number and password not matched ");
  }
  const isCorrectPassword = await artist.checkValidPassword(password);
  if (!isCorrectPassword) {
    return res.json("Not Registered artist");
  }
  await cookieToken(artist, res);

  // Retrieve recently played songs for the artist
  const artistId = artist._id;
  const artistRecentlyPlayed = await Play.find({ artistId }).sort({
    timestamp: -1,
  });
  res.status(200).json({ artist, recentlyPlayed: artistRecentlyPlayed });
};

/**
 * Log Out artist
 * @param req
 * @param res
 * @param next
 */
export const logOut = async (req: P["rq"], res: P["rs"], next: P["n"]) => {
  res.cookie(secrets.token, null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout artist Successfully",
  });
};
/**
 * Forget Password
 */
export const forgetPassword = async (req: P['rq'], res: P['rs'], next: P['n']) => {
  const { phone } = req.body;
  if (!phone ) {
    return res.json('mobile number Required');
  }
  const artist = await Artist.findOne({ phone });
  if(!artist) {
    res.status(500).json('Artist not found')
  }
  try {
    /**
     * For Sending OTP to the artist phone
     */
    const india = toIND(phone);
    await sendSMS(india);
    res.json("OTP has been sent")
  } catch (error) {
    res.status(500).json(error);
  }
};

/**
 * Reset Password
 */


export const resetPassword = async (
  req: P["rq"],
  res: P["rs"],
  next: P["n"]
) => {
  const { newpassword, phone, otp } = req.body;
  if (!newpassword || !otp || !phone) {
    return res.json("OTP is required");
  }

  const artist = await Artist.findOne({ phone });

  if (!artist) {
    return res.json("artist not found");
  } else {
    console.log(artist);
  }

  try {
    const india = toIND(phone);
    const response = await verifyOTP(india, otp);
    console.log(response);
    if (response) {
      // Update the password
      artist.password = newpassword;

      // Save the artist object to persist the new password
      await artist.save();

      res.status(200).json(artist);
      console.log(newpassword);
    } 
  } catch (error) {
    res.status(500).json("error");
  }
};

// export const follower = async (req, res) => {
//   try {
//     const { artistId, userId } = req.body;
//     // Check if the user with the provided userId exists in your database
//     const userExists = await User.exists({ _id: userId });
//     if (!userExists) {
//       return res.status(401).json({ message: "Please register to follow the artist." });
//     }

//     const existingFollow = await Artist.findOne({ artistId });
//     if (existingFollow) {
//       // Check if the user has already liked the song
//       const userIndex = existingFollow.followers.indexOf(userId);

//       if (userIndex !== -1) {
//         // Remove the userId from the existing document's userId array
//         existingFollow.followers.splice(userIndex, 1);
//         existingFollow.followercount -= 1;
//         await existingFollow.save();
//         res.status(200).json({ message: "UnFollowed song." });
//       } else {
//         // Add the userId to the existing document's userId array
//         existingFollow.followers.push(userId);
//         existingFollow.followercount += 1;
//         await existingFollow.save();
//         res.status(200).json({ message: "Followed song." });
//       }
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Error toggling the Follow status." });
//   }
// };



export const follower = async (req, res) => {
  try {
    const { artistId, userId } = req.body;

    // Check if the user with the provided userId exists in your database
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(401).json({ message: "Please register to follow the artist." });
    }

    // Find the artist based on artistId
    const existingArtist = await Artist.findById(artistId);

    if (!existingArtist) {
      return res.status(404).json({ message: "Artist not found." });
    }

    // Check if the user is already following the artist
    if (existingArtist.followers.includes(userId)) {
      // User is already following, so unfollow
      existingArtist.followers.pull(userId);
      existingArtist.followercount -= 1;
      await existingArtist.save();
      res.status(200).json({ message: "Unfollowed artist." });
    } else {
      // User is not following, so follow
      existingArtist.followers.push(userId);
      existingArtist.followercount += 1;
      await existingArtist.save();
      res.status(200).json({ message: "Followed artist." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error toggling the follow status." });
  }
};
