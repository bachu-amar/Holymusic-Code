import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { model, Schema } from 'mongoose';

import {
  BASE_URL,
  FORGET_PASSWORD_EXPIRE,
  JWT_EXPIRY,
  JWT_SECRET,
} from '@/config';
import crypto from 'crypto';
import { UserRoles } from '@/typings/enums';

type UserDocument = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  status: string;
  avatar: {
    type: string;
    id: string;
    previewUrl: string;
  };
  forgetPasswordToken: string;
  forgetPasswordExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
  provider: string;
  refreshToken: string;
  accessToken: string;
  recentlyplayed:[{type:Schema.Types.ObjectId,ref:'songs'}]
  // methods
  setPassword: (password: string) => void;
  checkValidPassword: (userSendPassword: string) => Promise<boolean>;
  getJwtToken: () => Promise<string>;
  getForgetPasswordToken: () => Promise<string>;
  getForgetPasswordLink: () => Promise<string>;
};

export const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: [true, 'Please Provide a name'],
    maxLength: [50, 'Name should be under 50 characters'],
  },
  // email: {
  //   type: String,
  //   validate: {
  //     validator: validator.isEmail,
  //     message: 'Please Provide a valid email',
  //   },
  //   unique: true,
  // },
  phone: {
    type: String,
    required: [true, 'Please Provide a phone number'],
    unique: true,
  },
  password: {
    type: String,
    required: [false, 'Please Provide a password'],
    minLength: [8, 'Password should be atleast 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: [UserRoles.ADMIN, UserRoles.USER],
    default: UserRoles.USER,
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending',
  },
  avatar: {
    type: String,
    id: { type: String },
    previewUrl: { type: String },
  },
  forgetPasswordToken: {
    type: String,
  },
  forgetPasswordExpiry: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  refreshToken: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  
});

// For Hashing Password
const salt = bcrypt.genSaltSync(10);

// Set Password
userSchema.methods.setPassword = async function (password: string) {
  this.password = bcrypt.hashSync(password, salt);
};
// Check Valid Password
userSchema.methods.checkValidPassword = async function (
  userSendPassword: string
) {
  return bcrypt.compare(userSendPassword, this.password);
};
// Get JWT Token
userSchema.methods.getJwtToken = async function () {
  const user = {
    id: this._id,
    name: this.name,
    role: this.role,
  };
  return jwt.sign(
    { ...user, iat: Math.floor(Date.now() / 1000) - 30 },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
    }
  );
};
// Get User id from token
userSchema.methods.getUserIdFromToken = async function (token: string) {
  if (!token) throw new Error('Token Required');
  type Decoded = {
    _id: string;
  };
  const decoded = jwt.verify(token, JWT_SECRET) as Decoded;
  return decoded._id;
};
// Get Forget Password Token
userSchema.methods.getForgetPasswordToken = async function () {
  const token = crypto.randomBytes(16).toString('hex');
  const hashToken = crypto.createHash('sha256').update(token).digest('hex');
  this.forgetPasswordToken = hashToken;
  this.forgetPasswordExpiry = (Date.now() + FORGET_PASSWORD_EXPIRE) as any;
  return hashToken;
};
// Get Forget Password Link
userSchema.methods.getForgetPasswordLink = async function () {
  const token = await this.getForgetPasswordToken();
  return `${BASE_URL}/reset-password/${token}`;
};

// Encrypt password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model('users', userSchema);
export default User;

