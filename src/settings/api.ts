const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const fetchPosts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/posts`);
    const data = await response.json();
    console.log('GET Response:', data);
    return data;
  } catch (error) {
    console.error('GET Error:', error);
    throw error;
  }
};

export const createPost = async (postData: {
  title: string;
  body: string;
  userId: number;
}) => {
  try {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    const data = await response.json();
    console.log('POST Response:', data);
    return data;
  } catch (error) {
    console.error('POST Error:', error);
    throw error;
  }
};

