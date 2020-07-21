/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { IPixel } from './pixel';

interface IPlace {
  id?: string,
  name: string,
  colors: string[],
  width: number,
  height: number,
  pixels: IPixel,
  url: string,
}

type IPlaceDocument = IPlace & mongoose.Document;

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  colors: [{
    type: String,
    required: true,
  }],
  width: {
    type: Number,
    height: Number,
  },
  height: {
    type: Number,
    height: Number,
  },
  pixels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pixel',
    },
  ],
  url: {
    type: String,
    required: true,
  },
});

placeSchema.plugin(uniqueValidator);

placeSchema.set('toJSON', {
  transform: (document, returnedObject: IPlaceDocument) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Place = mongoose.model<IPlaceDocument>('Place', placeSchema);

export { IPlace, Place };
