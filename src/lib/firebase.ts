import { initializeApp } from "firebase/app";

import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtGBIIq9lkx86Gt51DYXWIXWeOQrAkG2I",
  authDomain: "saas-8bfac.firebaseapp.com",
  projectId: "saas-8bfac",
  storageBucket: "saas-8bfac.firebasestorage.app",
  messagingSenderId: "349316370021",
  appId: "1:349316370021:web:60fc868296c170dfc9008c"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed', snapshot => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        if (setProgress) setProgress(progress)
        switch (snapshot.state) {
          case 'paused':
            console.log('upload is paused'); break;
          case 'running':
            console.log('upload is running'); break;
        }
      }, error => {
        reject(error)
      },()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL)
        })
      })
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}
