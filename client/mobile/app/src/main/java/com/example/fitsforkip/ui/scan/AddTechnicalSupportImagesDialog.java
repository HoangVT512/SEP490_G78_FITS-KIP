package com.example.fitsforkip.ui.scan;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.example.fitsforkip.R;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class AddTechnicalSupportImagesDialog extends AlertDialog {

    public static final int REQUEST_CAMERA = 100;
    public static final int REQUEST_GALLERY = 101;
    public static final int CAMERA_PERMISSION_REQUEST = 102;

    private Activity activity;
    private OnImagesSelectedListener listener;
    private OnImageCaptureRequested imageCaptureRequestedListener;
    private List<String> selectedImagePaths = new ArrayList<>();
    private TextView tvSelectedImages;
    private String currentPhotoPath;

    public interface OnImagesSelectedListener {
        void onImagesSelected(List<String> imagePaths);
    }

    public interface OnImageCaptureRequested {
        void requestCamera();
        void requestGallery();
    }

    public AddTechnicalSupportImagesDialog(Activity activity, OnImagesSelectedListener listener) {
        super(activity);
        this.activity = activity;
        this.listener = listener;
    }

    public void setImageCaptureRequestedListener(OnImageCaptureRequested listener) {
        this.imageCaptureRequestedListener = listener;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View view = LayoutInflater.from(getContext()).inflate(R.layout.dialog_add_technical_support_images, null);
        setContentView(view);

        tvSelectedImages = view.findViewById(R.id.tvSelectedImages);

        Button btnTakePhoto = view.findViewById(R.id.btnTakePhoto);
        Button btnChooseFromGallery = view.findViewById(R.id.btnChooseFromGallery);
        Button btnSkip = view.findViewById(R.id.btnSkip);
        Button btnContinue = view.findViewById(R.id.btnContinue);

        btnTakePhoto.setOnClickListener(v -> takePhoto());
        btnChooseFromGallery.setOnClickListener(v -> chooseFromGallery());
        btnSkip.setOnClickListener(v -> {
            listener.onImagesSelected(new ArrayList<>());
            dismiss();
        });
        btnContinue.setOnClickListener(v -> {
            if (!selectedImagePaths.isEmpty()) {
                listener.onImagesSelected(selectedImagePaths);
                dismiss();
            } else {
                Toast.makeText(getContext(), "Vui lòng chọn ít nhất một ảnh", Toast.LENGTH_SHORT).show();
            }
        });

        updateSelectedImagesText();
    }

    private void takePhoto() {
        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
            return;
        }

        if (imageCaptureRequestedListener != null) {
            imageCaptureRequestedListener.requestCamera();
        }
    }

    private void chooseFromGallery() {
        if (imageCaptureRequestedListener != null) {
            imageCaptureRequestedListener.requestGallery();
        }
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = activity.getExternalFilesDir("Pictures");
        File image = File.createTempFile(imageFileName, ".jpg", storageDir);
        currentPhotoPath = image.getAbsolutePath();
        return image;
    }

    public Uri getPhotoUri() {
        File photoFile = null;
        try {
            photoFile = createImageFile();
        } catch (IOException ex) {
            Toast.makeText(getContext(), "Lỗi tạo file ảnh", Toast.LENGTH_SHORT).show();
            return null;
        }
        if (photoFile != null) {
            return FileProvider.getUriForFile(activity, "com.example.fitsforkip.fileprovider", photoFile);
        }
        return null;
    }

    // XỬ LÝ KẾT QUẢ TỪ CAMERA VÀ GALLERY
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode != Activity.RESULT_OK) return;

        if (requestCode == REQUEST_CAMERA) {
            // XỬ LÝ ẢNH TỪ CAMERA
            if (data != null && data.getData() != null) {
                Uri imageUri = data.getData();
                Log.d("SaveImage", "=== LƯU ẢNH TỪ CAMERA ===");
                Log.d("SaveImage", "URI: " + imageUri.toString());

                // Lấy path từ URI của FileProvider
                String imagePath = getPathFromFileProviderUri(imageUri);

                if (imagePath != null) {
                    File file = new File(imagePath);
                    if (file.exists()) {
                        Log.d("SaveImage", "File tồn tại: " + imagePath);
                        selectedImagePaths.add(imagePath);
                        updateSelectedImagesText();
                        Toast.makeText(getContext(), "Đã thêm ảnh! Tổng: " + selectedImagePaths.size(), Toast.LENGTH_SHORT).show();
                    } else {
                        Log.e("SaveImage", "File không tồn tại: " + imagePath);
                        Toast.makeText(getContext(), "Lỗi: Không tìm thấy file ảnh", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Log.e("SaveImage", "Không thể lấy đường dẫn từ URI");
                    Toast.makeText(getContext(), "Lỗi: Không thể lấy đường dẫn ảnh", Toast.LENGTH_SHORT).show();
                }
            }
        } else if (requestCode == REQUEST_GALLERY) {
            // XỬ LÝ ẢNH TỪ GALLERY
            if (data != null && data.getData() != null) {
                Uri imageUri = data.getData();
                Log.d("SaveImage", "=== LƯU ẢNH TỪ GALLERY ===");
                Log.d("SaveImage", "URI: " + imageUri.toString());

                String imagePath = getRealPathFromURI(imageUri);

                if (imagePath != null) {
                    File file = new File(imagePath);
                    if (file.exists()) {
                        Log.d("SaveImage", "File tồn tại: " + imagePath);
                        selectedImagePaths.add(imagePath);
                        updateSelectedImagesText();
                        Toast.makeText(getContext(), "Đã thêm ảnh! Tổng: " + selectedImagePaths.size(), Toast.LENGTH_SHORT).show();
                    } else {
                        Log.e("SaveImage", "File không tồn tại: " + imagePath);
                        Toast.makeText(getContext(), "Lỗi: File không tồn tại", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Log.e("SaveImage", "Không thể lấy đường dẫn từ URI");
                    Toast.makeText(getContext(), "Lỗi: Không thể lấy đường dẫn ảnh", Toast.LENGTH_SHORT).show();
                }
            }
        }
    }

    // LẤY PATH TỪ FILE PROVIDER URI (CHO CAMERA)
    private String getPathFromFileProviderUri(Uri uri) {
        try {
            Log.d("getPathFromFileProvider", "URI: " + uri.toString());
            Log.d("getPathFromFileProvider", "Scheme: " + uri.getScheme());

            if ("content".equals(uri.getScheme())) {
                String path = uri.getPath(); // Ví dụ: /external_files/Pictures/JPEG_xxx.jpg
                Log.d("getPathFromFileProvider", "Path from URI: " + path);

                if (path != null && path.startsWith("/external_files/")) {
                    // Bỏ "/external_files/" và lấy phần còn lại
                    String relativePath = path.substring("/external_files/".length());
                    Log.d("getPathFromFileProvider", "Relative path: " + relativePath);

                    // Ghép với thư mục external files
                    File externalFilesDir = activity.getExternalFilesDir(null);
                    if (externalFilesDir != null) {
                        File file = new File(externalFilesDir, relativePath);
                        String absolutePath = file.getAbsolutePath();
                        Log.d("getPathFromFileProvider", "Absolute path: " + absolutePath);

                        if (file.exists()) {
                            Log.d("getPathFromFileProvider", "File exists: " + absolutePath);
                            return absolutePath;
                        } else {
                            Log.e("getPathFromFileProvider", "File does not exist: " + absolutePath);
                        }
                    }
                }
            }

            Log.e("getPathFromFileProvider", "Cannot get path from URI");
            return null;
        } catch (Exception e) {
            Log.e("getPathFromFileProvider", "Error: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // LẤY PATH TỪ CONTENT URI (CHO GALLERY)
    private String getRealPathFromURI(Uri uri) {
        String path = null;

        Log.d("getRealPath", "URI: " + uri.toString());
        Log.d("getRealPath", "Scheme: " + uri.getScheme());

        if ("file".equalsIgnoreCase(uri.getScheme())) {
            path = uri.getPath();
            Log.d("getRealPath", "File path: " + path);
            return path;
        }

        if ("content".equalsIgnoreCase(uri.getScheme())) {
            String[] projection = {MediaStore.Images.Media.DATA};
            Cursor cursor = null;
            try {
                cursor = activity.getContentResolver().query(uri, projection, null, null, null);
                if (cursor != null && cursor.moveToFirst()) {
                    int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
                    path = cursor.getString(column_index);
                    Log.d("getRealPath", "Content path from cursor: " + path);
                }
            } catch (Exception e) {
                Log.e("getRealPath", "Error getting path from cursor: " + e.getMessage());
                // Fallback: copy file to app directory
                path = copyImageToAppDirectory(uri);
                Log.d("getRealPath", "Fallback to copy: " + path);
            } finally {
                if (cursor != null) {
                    cursor.close();
                }
            }
        }

        if (path == null) {
            path = uri.getPath();
            Log.d("getRealPath", "Final fallback path: " + path);
        }

        return path;
    }

    // COPY ẢNH VÀO THƯ MỤC APP (FALLBACK CHO GALLERY)
    private String copyImageToAppDirectory(Uri uri) {
        try {
            String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
            String fileName = "GALLERY_" + timeStamp + ".jpg";
            File destDir = activity.getExternalFilesDir("Pictures");
            if (!destDir.exists()) {
                destDir.mkdirs();
            }
            File destFile = new File(destDir, fileName);

            FileInputStream fis = (FileInputStream) activity.getContentResolver().openInputStream(uri);
            FileOutputStream fos = new FileOutputStream(destFile);
            byte[] buffer = new byte[1024];
            int length;
            while ((length = fis.read(buffer)) > 0) {
                fos.write(buffer, 0, length);
            }
            fos.close();
            fis.close();

            return destFile.getAbsolutePath();
        } catch (Exception e) {
            Log.e("copyImage", "Error: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private void updateSelectedImagesText() {
        if (selectedImagePaths.isEmpty()) {
            tvSelectedImages.setText("Chưa chọn ảnh nào");
        } else {
            tvSelectedImages.setText("Đã chọn " + selectedImagePaths.size() + " ảnh");
        }
    }
}