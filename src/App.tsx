import React, { useState, useEffect } from "react";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { createBlog, deleteBlog } from "./graphql/mutations";
import { listBlogs } from "./graphql/queries";

import awsExports from "./aws-exports";
import { ListBlogsQuery, Blog } from "./API";

Amplify.configure(awsExports);
const initialState = { name: "", body: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  //const [blogs, setBlogs] = useState<ListBlogsQuery>();
  const [ blogs, setBlogs ] = useState<Blog[]>([]);

  useEffect(() => {
    fetchBlogs()
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [event.target.name]: event.target.value });
  };

  const fetchBlogs = async () => {
    try {
      const blogData = (await API.graphql(graphqlOperation(listBlogs))) as {
        data: ListBlogsQuery
      }
      setBlogs(
        blogData.data.listBlogs?.items as Blog[]
      );
    } catch (err) {
      console.log("Error fetching blogs" + err);
    }
  };
  const addBlog = async () => {
    try {
      if (!formState.name || !formState.body) return;
      const blog = { ...formState };
      if (blogs) {
        await API.graphql(graphqlOperation(createBlog, { input: blog }));
        await fetchBlogs();
        setFormState(initialState);
      }
    } catch (err) {
      console.log("error creating blog: ", err);
    }
  };

  const delBlog = async (index: number, id?: string) => {
    try {
      await API.graphql(graphqlOperation(deleteBlog, { input: { id } }));
    } catch (err) {
      console.log('error deleting blog: ', err);
    } finally {
      setBlogs(
        blogs?.filter(blog => blog?.id !== id)
      );
    }
  };

  return (
    <div id="wrapper" style={styles.container}>
      <h2>Amplify Todos</h2>
      <input
        onChange={handleInputChange}
        name="name"
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={handleInputChange}
        name="body"
        style={styles.input}
        value={formState.body}
        placeholder="Type your blog..."
      />
      <button style={styles.button} onClick={addBlog}>
        Create Blog
      </button>
      {blogs &&
        blogs?.map((blog, index) => {
          return (
            <div key={blog?.id || index} style={styles.todo}>
              <p style={styles.todoName}>{blog?.name}</p>
              <p style={styles.todoDescription}>{blog?.body}</p>
              <button style={styles.button} onClick={() => delBlog(index, blog?.id)}>Delete</button>
            </div>
          );
        })}
    </div>
  );
};
const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    //real weird issue: https://github.com/cssinjs/jss/issues/1344
    flexDirection: "column" as "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
};

export default App;
