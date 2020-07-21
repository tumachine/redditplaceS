/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';

interface IPixel {
  id?: string,
  x: number,
  y: number,
  color: number,
  place: string,
}

type IPixelDocument = IPixel & mongoose.Document;

const pixelSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  color: {
    type: Number,
    required: true,
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: true,
  },
});

pixelSchema.set('toJSON', {
  transform: (document, returnedObject: IPixelDocument) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Pixel = mongoose.model<IPixelDocument>('Pixel', pixelSchema);

export { IPixel, Pixel, IPixelDocument };
