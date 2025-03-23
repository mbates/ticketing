import mongoose from "mongoose";
import { PasswordManager } from "../services/password-manager";

interface UserAttributes {
  email: string;
  password: string;
}

interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  //   updatedAt: string;
  //   createdAt: string;
}

interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttributes): UserDocument;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // clean up response json object
      transform: (_doc, ret, _options) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// use function keyword to prevent override of "this"
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    // get password from document
    const hashed = await PasswordManager.toHash(this.get("password"));

    // set hashed pasword to document
    this.set("password", hashed);
  }

  // mongoose function to complete asyn
  done();
});

userSchema.statics.build = (attrs: UserAttributes) => {
  return new User(attrs);
};

const User = mongoose.model<UserDocument, UserModel>("User", userSchema);

export { User };
