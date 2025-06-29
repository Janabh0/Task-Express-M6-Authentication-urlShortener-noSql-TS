import Url from "../../models/Url";
import shortid from "shortid";
import User from "../../models/User";
import { NextFunction, Request, Response } from "express";

const baseUrl = "http://localhost:8000/urls";

export const shorten = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // create url code
  const urlCode = shortid.generate();
  try {
    req.body.shortUrl = `${baseUrl}/${urlCode}`;
    req.body.urlCode = urlCode;
    req.body.userId = req.user?.userId;
    const newUrl = await Url.create(req.body);
    await User.findByIdAndUpdate(req.user?.userId, {
      $push: { urls: newUrl._id },
    });
    res.json(newUrl);
  } catch (err) {
    next(err);
  }
};

export const redirect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });
    if (url) {
      res.redirect(url.longUrl || "");
    } else {
      res.status(404).json("No URL Found");
    }
  } catch (err) {
    next(err);
  }
};

export const deleteUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });
    if (!url) {
      res.status(404).json("No URL Found");
      return;
    }

    if (url.userId?.toString() !== req.user?.userId) {
      res.status(403).json("You can only delete your own URLs");
      return;
    }

    await Url.findByIdAndDelete(url._id);
    res.status(200).json("Deleted");
  } catch (err) {
    next(err);
  }
};
