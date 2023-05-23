import cv2
import math
import numpy as np
import sys

def mitigate_blue(img):
    height, width, channels = img.shape
    for x in range(0, width):
        for y in range(0, height):
            val = img[y,x]
            GB_avg = (val[1] + val[2]) / 2
            if val[0] > 235 and val[1] > 235 and val[2] > 235:
                img[y,x] = [100, 100, 100]
            elif GB_avg < val[0] and (val[0] != 100 and val[1] != 100 and val[2] != 100):
                val[0] = 80 # round(val[0] - GB_avg * 0.75)
                """ val[1] = val[1] - 30
                val[2] = val[2] - 30 """
                #val[0] = val[0] - 30
                img[y,x] = val
            else:
                img[y,x] = val
    return img

def sharpen(img):
  #kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
  kernel = np.array([
      [0,-1,0],
      [-1,5,-1],
      [0,-1,0]
    ])
  return cv2.filter2D(img, -1, kernel)

def apply_mask(matrix, mask, fill_value):
    masked = np.ma.array(matrix, mask=mask, fill_value=fill_value)
    return masked.filled()

def apply_threshold(matrix, low_value, high_value):
    low_mask = matrix < low_value
    matrix = apply_mask(matrix, low_mask, low_value)

    high_mask = matrix > high_value
    matrix = apply_mask(matrix, high_mask, high_value)

    return matrix

def simplest_color_balance(img, percent):
    assert img.shape[2] == 3
    assert percent > 0 and percent < 100

    half_percent = percent / 200.0

    channels = cv2.split(img)

    out_channels = []
    for channel in channels:
        assert len(channel.shape) == 2
        # find the low and high precentile values (based on the input percentile)
        height, width = channel.shape
        vec_size = width * height
        flat = channel.reshape(vec_size)

        assert len(flat.shape) == 1

        flat = np.sort(flat)

        n_cols = flat.shape[0]

        low_val  = flat[int(math.floor(n_cols * half_percent))]
        high_val = flat[int(math.ceil( n_cols * (1.0 - half_percent)))]

        # saturate below the low percentile and above the high percentile
        thresholded = apply_threshold(channel, low_val, high_val)
        # scale the channel
        normalized = cv2.normalize(thresholded, thresholded.copy(), 0, 255, cv2.NORM_MINMAX)
        out_channels.append(normalized)

    return cv2.merge(out_channels)

if __name__ == '__main__':
    img = cv2.imread(sys.argv[1])
    out = simplest_color_balance(img, 1)

    divider = 4 if (img.shape[1] > 2000 or img.shape[0] > 2000) else 2
    width = math.floor(img.shape[1] / divider)
    height = math.floor(img.shape[0] / divider)
    out = sharpen(out)

    cv2.imwrite('./testdata/test_out.jpg', out)

    img_resized = cv2.resize(img, (width, height))
    out_resized = cv2.resize(out, (width, height))

    cv2.imshow("before", img_resized)
    cv2.imshow("after", out_resized)
    cv2.waitKey(0)