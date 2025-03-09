import { Cloudinary } from "@cloudinary/url-gen";
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME } from '@env'

const cld = new Cloudinary({
    cloud: {
        cloudName: CLOUDINARY_CLOUD_NAME
    },
    url:{
        secure: true
    }
});

const uploadImgURL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
const uploadVideoURL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`

export const uploadMedia = async (uri: string, mediaType: 'image' | 'video') => {
    // Create form data for the upload
    const formData = new FormData();
    
    // For React Native, we need to create a file object with uri, type and name
    const fileType = mediaType === 'image' ? 'image/jpeg' : 'video/mp4';
    const fileName = uri.split('/').pop() || 'file';
    
    // @ts-ignore - React Native's FormData implementation is different
    formData.append('file', {
        uri: uri,
        type: fileType,
        name: fileName,
    });
    
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const uploadURL = mediaType === 'image' ? uploadImgURL : uploadVideoURL;

    try {
        const response = await fetch(uploadURL, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            }
            
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return data.secure_url;
        
    } catch (error) {
        console.error(`Error uploading ${mediaType}:`, error);
        throw error;
    }
}


export const uploadImage = (uri: string) => uploadMedia(uri, 'image');
export const uploadVideo = (uri: string) => uploadMedia(uri, 'video');
export { cld };



