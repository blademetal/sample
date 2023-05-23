from django.db import models
from django.utils import translation
from jobs.models import Job
import os.path
from PIL import Image as Pillow
from io import BytesIO
from django.core.files.base import ContentFile
from grain_segmenter_backend.settings import THUMB_SIZE
import boto3
import tempfile

class Image(models.Model):
    image = models.ImageField(
        upload_to='images'
    )
    image_thumbnail = models.ImageField(
        upload_to='image_thumbs',
        editable=False,
        null=True
    )
    mask = models.ImageField(
        upload_to='masks',
        editable=True,
        null=True,
        blank=True
    )
    mask_thumbnail = models.ImageField(
        upload_to='mask_thumbs',
        editable=True,
        null=True,
        blank=True
    )
    lon = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    lat = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    job = models.ForeignKey(
        Job,
        verbose_name='Job',
        on_delete=models.SET_NULL,
        null=True,
        blank=False,
        editable=True
    )

    def save(self, *args, **kwargs):
        if not  self.make_thumbnail():
            # set to a default thumbnail
            raise Exception('Could not create thumbnail - is the file type valid?')
        super(Image, self).save(*args, **kwargs)
    
    def make_thumbnail(self):
        """ s3 = boto3.resource('s3') """

        """ 
        bucket = s3.Bucket(os.environ.get('AWS_STORAGE_BUCKET_NAME'))
        object = bucket.Object(self.image)
        tmp = tempfile.NamedTemporaryFile()
        """
        
        print('SELF.IMage', self.image)

        image = Pillow.open(self.image)
        image.thumbnail(THUMB_SIZE, Pillow.ANTIALIAS)

        thumb_name, thumb_extension = os.path.splitext(self.image.name)
        thumb_extension = thumb_extension.lower()
        thumb_filename = thumb_name + '_thumb' + thumb_extension

        if thumb_extension in ['.jpg', '.jpeg']:
            FTYPE = 'JPEG'
        elif thumb_extension == '.gif':
            FTYPE = 'GIF'
        elif thumb_extension == '.png':
            FTYPE = 'PNG'
        else:
            return False    # Unrecognized file type

        # Save thumbnail to in-memory file as StringIO
        temp_thumb = BytesIO()
        image.save(temp_thumb, FTYPE)
        temp_thumb.seek(0)

        # set save=False, otherwise it will run in an infinite loop
        self.image_thumbnail.save(thumb_filename, ContentFile(temp_thumb.read()), save=False)
        temp_thumb.close()
        return True

    class Meta(object):
        verbose_name = 'Image'
        verbose_name_plural = 'Images'