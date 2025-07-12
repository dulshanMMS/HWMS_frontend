import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../config/firebase"; 

const storage = getStorage(app);

export const uploadProfileImage = async (file, userId) => {
  const storageRef = ref(storage, `profilePhotos/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
