import express from 'express';
import { Place } from '../models/place';
import { createPlace, removePlace, placePixelsEfficiently, placeMap } from '../utils/placeHelper';
import { Pixel, IPixel } from '../models/pixel';
import { ws } from '../utils/websocket';

require('express-async-errors');

const placeRouter = express.Router();

placeRouter.get('/', async (request, response) => {
  const places = await Place.find({});
  response.json(places);
});

placeRouter.get('/:name', async (request, response) => {
  const place = await Place.findOne({ name: request.params.name });
  response.json(place);
});

placeRouter.get('/:name/pixels', async (request, response) => {
  const { name } = request.params;
  const place = await Place.findOne({ name });

  if (place === null) {
    return response.status(400).json({ error: 'This place does not exist' });
  }
  const { x, y } = request.query;

  let result: any = null;
  if (x && y) {
    result = await Pixel.findOne({ x: Number(x), y: Number(y), place: place?.id });
  } else {
    result = await Pixel.find({ place: place?.id });
  }
  response.json(result);
});

placeRouter.get('/:name/remaining-pixels', async (request, response) => {
  const { name } = request.params;
  const place = await Place.findOne({ name });

  if (place === null) {
    return response.status(400).json({ error: 'This place does not exist' });
  }

  const pixels = placeMap.get(place?.name)?.pixels;
  if (pixels !== undefined) {
    response.json(pixels);
  }
});

placeRouter.post('/', async (request, response) => {
  const place = new Place(request.body);
  place.url = `/images/places/${place.name}.png`;
  const result = await place.save();

  createPlace(place.name, place.width, place.height, place.colors[0]);

  response.status(201).json(result);
});

placeRouter.post('/:name', async (request, response) => {
  const placeName = request.params.name;
  const place = await Place.findOne({ name: placeName });

  const pixel: IPixel = {
    x: request.body.x,
    y: request.body.y,
    place: place?.id,
    color: request.body.color,
  };

  if (pixel.x < 0 || pixel.x >= place!.width || pixel.y < 0 || pixel.y >= place!.height) {
    return response.status(400).json({ error: 'incorrect pixel placement' });
  }

  const result = await Pixel.findOneAndUpdate(
    { place: pixel.place, x: pixel.x, y: pixel.y },
    pixel,
    {
      new: true,
      upsert: true,
    },
  );

  placePixelsEfficiently(placeName, pixel, place!.colors);

  response.status(201).json(result);
});

placeRouter.delete('/:name', async (request, response) => {
  const { name } = request.params;

  await Place.findOneAndRemove({ name });
  removePlace(name);
  response.status(204).end();
});

export default placeRouter;
