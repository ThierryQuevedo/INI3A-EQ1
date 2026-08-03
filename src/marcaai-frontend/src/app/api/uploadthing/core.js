import {createUploadthing} from "uploadthing/next";
import { revalidatePath } from "next/cache";

const f = createUploadthing();

const getSessionUser = async () => {
    return{id:}
}

export const ourFileRouter ={ 
    profilePicture: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1    
        }
    }).onUploadComplete(async ({metadata, file}) => {
        console.log("Upload da foto concluido: ",file.url);
    }),

    bannerImage: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 1
        }
    }).onUploadComplete(async ({metadata,file}) => {
        console.log("Upload do banner concluido: ",file.url);
    })
};