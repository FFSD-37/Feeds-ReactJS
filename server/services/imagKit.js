import ImageKit from "imagekit";

const imagekit = new ImageKit({
  urlEndpoint: 'https://ik.imagekit.io/lidyx2zxm/',
  publicKey: 'public_wbpheuS28ohGGR1W5QtPU+uv/z8=',
  privateKey: 'private_FkCjTDNipiMr/iAb80jMnflnOPk='
});

const handleimagKitauth=(req,res)=>{
    try {
    const authParams = imagekit.getAuthenticationParameters();
    return res.json(authParams);
    } catch (error) {
        throw new Error(error);
    }
}

export {handleimagKitauth}