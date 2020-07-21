/* eslint-disable prefer-destructuring */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
import fs from 'fs';
import { loadImage, createCanvas, Canvas } from 'canvas';
import { performance } from 'perf_hooks';
import { IPixel } from '../models/pixel';
import { ws } from './websocket';

// colors of official reddit place
// const availableColors = [
//   '#820080',
//   '#888888',
//   '#ffffff',
//   '#222222',
//   '#ffa7d1',
//   '#e50000',
//   '#e59500',
//   '#a06a42',
//   '#e5d900',
//   '#94e044',
//   '#02be01',
//   '#00d3dd',
//   '#0083c7',
//   '#0000ea',
//   '#cf6ee4',
//   '#c4c4c4',
// ];

// initialize canvas on first user request
// after some time, save image
// before saving image, reset placed pixels and start collecting them

const getImagePath = (imageName: string) => `./static/images/places/${imageName}.png`;

// eslint-disable-next-line max-len
const placePixels = async (context: CanvasRenderingContext2D, pixels: IPixel[], colors: string[]) => {
  console.log(`Drawing ${pixels.length} amount of pixels`);
  for (let i = 0; i < pixels.length; i += 1) {
    context.fillStyle = colors[pixels[i].color];
    context.fillRect(pixels[i].x, pixels[i].y, 1, 1);
  }
};

const placePixel = async (context: CanvasRenderingContext2D, pixel: IPixel, colors: string[]) => {
  context.fillStyle = colors[pixel.color];
  context.fillRect(pixel.x, pixel.y, 1, 1);
};

const createPlace = (imageName: string, width: number, height: number, backgroundColor: string) => {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  const buffer = canvas.toBuffer('image/png');

  fs.writeFileSync(getImagePath(imageName), buffer);
};

const removePlace = (imageName: string) => {
  fs.unlink(getImagePath(imageName), (err) => {
    if (err) {
      console.log(err);
    }
    console.log(`Image "${imageName} removed`);
  });
};

class PixelPlace {
  timerSet: boolean;

  pixels: IPixel[];

  colors: string[];

  placeName: string;

  canvas: Canvas = createCanvas(0, 0);

  context = this.canvas.getContext('2d');

  constructor(placeName: string, colors: string[]) {
    this.timerSet = false;
    this.placeName = placeName;
    this.pixels = [];
    this.colors = colors;
    this.load();
  }

  load = async () => {
    const image = await loadImage(getImagePath(this.placeName));
    this.canvas = createCanvas(image.width, image.height);
    this.context = this.canvas.getContext('2d');
    this.context.drawImage(image, 0, 0);
  };

  save = async () => {
    const buffer = this.canvas.toBuffer('image/png');
    fs.writeFile(getImagePath(this.placeName), buffer, (err) => {});
  };

  getPixels = () => this.pixels;

  setPixel = (pixel: IPixel) => {
    ws.sendPixelsToUsers(this.placeName, [pixel]);
    this.pixels.push(pixel);
    this.context.fillStyle = this.colors[pixel.color];
    this.context.fillRect(pixel.x, pixel.y, 1, 1);

    if (!this.timerSet) {
      this.timerSet = true;

      setTimeout(async () => {
        this.pixels = [];

        this.timerSet = false;

        await this.save();
      }, 30000);
    }
  };
}

const placeMap = new Map<string, PixelPlace>();

const placePixelsEfficiently = (placeName: string, pixel: IPixel, colors: string[]) => {
  const pixelPlace = placeMap.get(placeName);
  if (pixelPlace) {
    pixelPlace.setPixel(pixel);
  } else {
    const place = new PixelPlace(placeName, colors);
    place.setPixel(pixel);

    placeMap.set(placeName, place);
  }
};

export {
  placePixel, placePixels, createPlace, removePlace, placePixelsEfficiently, placeMap,
};
