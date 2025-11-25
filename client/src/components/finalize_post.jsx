import { useEffect, useState } from 'react';
import ImageKit from 'imagekit-javascript';
import 'emoji-picker-element';
import { useLocation } from 'react-router-dom';
import { useUserData } from '../providers/userData';

const FinalizePost = () => {
  const { userData } = useUserData();
  const [caption, setCaption] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();

  const getAuth = async () => {
    return await fetch(import.meta.env.VITE_SERVER_URL + '/imagKitauth');
  };

  useEffect(() => {
    if (!state || !state.fromCreatePost) {
      window.location.href = '/create_post';
      return;
    }
    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith('uploadedFile_'),
    );
    if (!keys.length) return;

    keys.forEach(key => {
      const { data: base64 } = JSON.parse(localStorage.getItem(key));
      setMediaPreview(base64);
    });
  }, []);

  const uploadPost = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const keys = Object.keys(localStorage).filter(k =>
        k.startsWith('uploadedFile_'),
      );
      const { data: base64File, name } = JSON.parse(
        localStorage.getItem(keys[0]),
      );

      const authResponse = await getAuth();
      const authData = await authResponse.json();

      const imagekit = new ImageKit({
        publicKey: 'public_wbpheuS28ohGGR1W5QtPU+uv/z8=',
        urlEndpoint: 'https://ik.imagekit.io/lidyx2zxm/',
      });

      imagekit.upload(
        {
          file: base64File,
          fileName: name,
          tags: ['tag1'],
          token: authData.token,
          signature: authData.signature,
          expire: authData.expire,
        },
        async function (err, result) {
          if (err) {
            alert('Upload failed. Please try again.');
            setLoading(false);
            return;
          }

          await fetch(import.meta.env.VITE_SERVER_URL + '/shareFinalPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              caption,
              type: !state.selectedPostType ? 'Img' : 'Reels',
              avatar: result.url,
            }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                localStorage.clear();
                window.location.href = '/home';
              }
            });

          setLoading(false);
        },
      );
    } catch (error) {
      console.error(error);
      alert('Unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] w-screen text-white">
      <div className="p-4 flex justify-center items-center border-b border-white/10">
        <h1 className="text-lg font-semibold">Create new post</h1>
      </div>

      <div className="flex flex-1 bg-black mr-5">
        <div className="flex w-1/2 bg-black flex items-center justify-center relative overflow-hidden">
          {mediaPreview && !state.selectedPostType && (
            <img
              src={mediaPreview}
              alt="preview"
              className="w-full h-full object-contain"
            />
          )}
          {mediaPreview && !!state.selectedPostType && (
            <video className="w-full h-full object-contain" controls>
              <source src={mediaPreview} />
            </video>
          )}
        </div>

        <div className=" w-1/3 bg-black border-l border-white/20 flex flex-col justify-between p-4">
          <form onSubmit={uploadPost}>
            <div className="flex items-center mb-4">
              <img
                src={userData.profileUrl}
                alt="user"
                className="w-8 h-8 rounded-full mr-3 object-cover"
              />
              <div className="font-semibold text-sm">{userData.username}</div>
            </div>

            <div className="relative mb-4">
              <textarea
                placeholder="Add a caption"
                className="w-full h-24 p-2 bg-gray-900 rounded-lg focus:outline-none"
                value={caption}
                onChange={e => setCaption(e.target.value)}
              />
            </div>

            <div className="border-t border-white/20 mt-4 pt-4 flex justify-center">
              <button
                type="submit"
                className="bg-white text-black font-semibold py-2 px-6 rounded-md hover:bg-gray-200 transition"
              >
                Share
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/60 flex flex-col justify-center items-center z-[9999]">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white mt-4 text-lg tracking-wide">
            Uploading your post...
          </p>
        </div>
      )}
    </div>
  );
};

export default FinalizePost;
