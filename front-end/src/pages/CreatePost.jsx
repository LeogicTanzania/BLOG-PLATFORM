import { useForm } from "react-hook-form";

import api from "../services/api"; // Our custom API service

export default function CreatePost() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    // Object to send form fields as multi-part
    const formData = new FormData();

    // Append uploaded image file to the FormData
    // 'data.image' is an array, access first file with [0]
    formData.append("image", data.image[0]);

    // Append post title, content & tags to formData
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("tags", data.tags);

    try {
      // Send POST req to '/posts' endpoint with the formData
      // Headers specifies content is multi-part
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Post Creation Failed:", error);
    }
  };

  return (
    // On form submission call 'handleSubmit' to run validation & then call 'onSubmit'
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("title", { required: true })} // Register field with validation
        placeholder="Enter Title"
      />

      <textarea
        {...register("content", { required: true })} // Register field with validation
        placeholder="Enter Content"
      />

      <input
        type="file"
        {...register("image", { required: true })}
        accept="image/*"
      />

      <button type="submit">CREATE POST</button>
    </form>
  );
}
