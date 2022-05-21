export const getBase64FromUrl = async (url: string): Promise<string> => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            if (reader.result !== null) {
                resolve(reader.result.toString());
            }
        }
    });
}

export const getImageDataByUrl = async (url: string): Promise<string> => {
    const base64Data = await getBase64FromUrl(url);
    return base64Data.replace('data:application/octet-stream', 'data:image/jpeg');
}
