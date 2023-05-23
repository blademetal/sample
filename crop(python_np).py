import os
import cv2
import numpy as np

def get_new_img_name(img, type):
  img_list = img.split('.')
  if len(img_list) == 2:
    return "{}_{}.{}".format(img_list[0], type, img_list[1])
  else:
    return img


parent = os.getcwd()
dir_path = os.path.join(parent, 'images')
end_dir_path = os.path.join(parent, 'cropped_images')
file_list = os.listdir(dir_path)
for img in file_list:
  img_path = os.path.join(dir_path, img)
  image = cv2.imread(img_path, cv2.IMREAD_COLOR)

  shapes = np.shape(image)
  h = shapes[0]
  w = shapes[1]

  if w == 1920 and h == 1080:

    print(w/2)
    print(h/2)


    LT = image[0:int(h/2), 0:int(w/2)]
    LT_path = os.path.join(end_dir_path, get_new_img_name(img, 'LT'))
    cv2.imwrite(LT_path, LT)

    RT = image[0:int(h/2), int(w/2):w]
    RT_path = os.path.join(end_dir_path, get_new_img_name(img, 'RT'))
    cv2.imwrite(RT_path, RT)

    LB = image[int(h/2):h, 0:int(w/2)]
    LB_path = os.path.join(end_dir_path, get_new_img_name(img, 'LB'))
    cv2.imwrite(LB_path, LB)

    RB = image[int(h/2):h, int(w/2):w]
    RB_path = os.path.join(end_dir_path, get_new_img_name(img, 'RB'))
    cv2.imwrite(RB_path, RB)
