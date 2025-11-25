import ImageKit from 'imagekit-javascript';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PostCreation = () => {
  const [selectedPostType, setSelectedPostType] = useState('image');
  const [postTypeText, setPostTypeText] = useState('Image Post');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images and videos
  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ];

  const postTypes = [
    { type: 'image', accept: 'image/*', label: 'Image Post' },
    { type: 'reel', accept: 'video/*', label: 'Reel Post' },
    { type: 'story', accept: 'image/*, video/*', label: 'Story Post' },
  ];

  const uploadToImageKit = async file => {
    const authRes = await fetch(
      import.meta.env.VITE_SERVER_URL + '/imagKitauth',
    );
    const authData = await authRes.json();

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const imagekit = new ImageKit({
          publicKey: 'public_wbpheuS28ohGGR1W5QtPU+uv/z8=',
          urlEndpoint: 'https://ik.imagekit.io/lidyx2zxm/',
        });

        imagekit.upload(
          {
            file: reader.result,
            fileName: file.name,
            tags: ['story'],
            token: authData.token,
            signature: authData.signature,
            expire: authData.expire,
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        );
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePostTypeSelect = (type, accept, label) => {
    setSelectedPostType(type);
    setPostTypeText(label);
    setIsDropdownOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    if (type === 'success') {
      setTimeout(() => setAlertMessage(''), 3000);
    }
  };

  const validateFile = file => {
    const fileType = file.type.split('/')[0];

    // Check if file type matches selected post type
    if (selectedPostType === 'image' && fileType !== 'image') {
      return {
        valid: false,
        error: 'Please select an image file for Image Post',
      };
    }

    if (selectedPostType === 'reel' && fileType !== 'video') {
      return {
        valid: false,
        error: 'Please select a video file for Reel Post',
      };
    }

    // Validate file type
    if (fileType === 'image') {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
          valid: false,
          error: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP',
        };
      }
      if (file.size > MAX_FILE_SIZE) {
        return {
          valid: false,
          error: `Image size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
      }
    } else if (fileType === 'video') {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return {
          valid: false,
          error: 'Invalid video format. Allowed: MP4, WebM, OGG, MOV',
        };
      }
      if (file.size > MAX_FILE_SIZE)
        return { valid: false, error: 'Video size must be less than 5MB' };
    } else {
      return {
        valid: false,
        error: 'Invalid file type. Please select an image or video',
      };
    }

    // Check for empty file
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty. Please select a valid file',
      };
    }

    return { valid: true };
  };

  const storeFilesInLocalStorage = files => {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('uploadedFile_')) localStorage.removeItem(k);
    });

    Array.from(files).forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = e => {
        localStorage.setItem(
          `uploadedFile_${i}`,
          JSON.stringify({
            name: file.name,
            data: e.target.result,
          }),
        );
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async event => {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        showAlert(validation.error, 'error');
        event.target.value = ''; // Reset input
        return;
      }

      const fileType = file.type.split('/')[0];

      try {
        if (selectedPostType !== 'story') {
          storeFilesInLocalStorage(files);
        }

        // Create preview
        const url = URL.createObjectURL(file);
        setPreviewSrc(url);
        setPreviewType(fileType);

        // Handle story type upload
        if (selectedPostType === 'story') {
          setIsLoading(true);
          try {
            // Simulate ImageKit upload - in real app, you'd call your backend
            const uploadResult = await uploadToImageKit(file);

            setProfileImageUrl(uploadResult.url);
            showAlert('Story uploaded successfully!', 'success');
          } catch (error) {
            console.error('Upload failed:', error);
            showAlert('Upload failed. Please try again', 'error');
          }
          // Clear loading state after handling success or error (avoids using finally)
          setIsLoading(false);
        } else {
          showAlert('File selected successfully!', 'success');
        }
      } catch (error) {
        console.error('File handling error:', error);
        showAlert('Error processing file. Please try again', 'error');
        event.target.value = '';
      }
    }
  };

  const handleContinue = async () => {
    if (selectedPostType === 'story') {
      if (!profileImageUrl) {
        showAlert('Story not uploaded yet', 'error');
        return;
      }

      console.log('Story confirmed:', profileImageUrl);
      await fetch(import.meta.env.VITE_SERVER_URL + '/createpost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          caption: '',
          postType: 'story',
          mediaUrl: profileImageUrl,
        }),
      });

      showAlert('Story published successfully!', 'success');

      setPreviewSrc(null);
      setPreviewType(null);
      setProfileImageUrl('');
    } else {
      if (!previewSrc) {
        showAlert('Please select a file first', 'error');
        return;
      }
      if (selectedPostType === 'image')
        navigate('/edit_post', { state: { fromCreatePost: true } });
      else
        navigate('/finalize_post', {
          state: { fromCreatePost: true, selectedPostType },
        });
    }
  };

  const handleAgainSelect = () => {
    setPreviewSrc(null);
    setPreviewType(null);
    setProfileImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#1a223d] via-[#2a3f6f] to-[#3f5fa7] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[#0f172a] rounded-2xl p-6 shadow-2xl border border-white/10">
        {/* Title */}
        <h4 className="text-white text-xl font-semibold mb-6 text-center tracking-wide">
          Create New Post
        </h4>

        {/* Alert */}
        {alertMessage && (
          <div
            className={`mb-5 flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
              alertType === 'error'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-green-500/20 text-green-400 border border-green-500/40'
            }`}
          >
            <span>{alertMessage}</span>
            <button
              className="text-lg hover:opacity-70"
              onClick={() => setAlertMessage('')}
            >
              ✕
            </button>
          </div>
        )}

        {/* Post Type Selector */}
        <div className="relative mb-5">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-[#1e293b] border border-white/10 text-white rounded-lg px-4 py-3 flex items-center justify-between hover:bg-[#24314d] transition"
          >
            <div className="font-medium">{postTypeText}</div>
            <div
              className={`transform transition ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              ▼
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
              {postTypes.map(option => (
                <button
                  key={option.type}
                  onClick={() =>
                    handlePostTypeSelect(
                      option.type,
                      option.accept,
                      option.label,
                    )
                  }
                  className="w-full text-left px-4 py-3 text-white hover:bg-[#2a3a60] transition"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* File Upload Box */}
        <label
          htmlFor="file-input"
          className="relative block w-full h-80 rounded-xl border-2 border-dashed border-white/20 bg-[#1f2937] flex items-center justify-center cursor-pointer overflow-hidden group hover:border-white/40 transition mb-6"
        >
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!previewSrc ? (
            <div className="text-center text-white space-y-3">
              <div className="text-4xl">📤</div>
              <p className="font-semibold">Upload your media</p>
              <p className="text-sm text-white/50">
                Click to select image or video
              </p>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {previewType === 'image' ? (
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <video
                  src={previewSrc}
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
          )}
        </label>

        {/* Buttons */}
        {previewSrc && selectedPostType !== 'story' && (
          <div className="flex gap-3">
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg"
            >
              Continue Editing
            </button>

            <button
              onClick={handleAgainSelect}
              className="px-6 py-3 rounded-lg bg-[#334155] text-white"
            >
              Choose Again
            </button>
          </div>
        )}

        {previewSrc && selectedPostType === 'story' && (
          <div className="flex gap-3">
            <button
              onClick={handleContinue}
              disabled={isLoading || alertType === 'error'}
              className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? 'Uploading...' : 'Confirm Story'}
            </button>

            <button
              onClick={handleAgainSelect}
              className="px-6 py-3 rounded-lg bg-[#334155] text-white"
              disabled={isLoading}
            >
              Choose Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCreation;
