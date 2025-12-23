package com.example.fitsforkip.data.remote;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.fitsforkip.util.BooleanTypeAdapter;
import com.example.fitsforkip.util.Constants;
import com.example.fitsforkip.util.DateTypeAdapter;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.IOException;
import java.security.cert.CertificateException;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
    private static final int TIMEOUT = 60;
    private static Retrofit retrofit = null;
    private static Retrofit authenticatedRetrofit = null;

    private static Gson createGson() {
        GsonBuilder gsonBuilder = new GsonBuilder();
        gsonBuilder.registerTypeAdapter(Boolean.class, new BooleanTypeAdapter());
        gsonBuilder.registerTypeAdapter(boolean.class, new BooleanTypeAdapter());
        gsonBuilder.registerTypeAdapter(Date.class, new DateTypeAdapter());
        return gsonBuilder.create();
    }

    // --- QUAN TRỌNG: Hàm tạo OkHttpClient bỏ qua lỗi SSL ---
    private static OkHttpClient getUnsafeOkHttpClient(Interceptor authInterceptor) {
        try {
            // 1. Tạo TrustManager tin tưởng mọi chứng chỉ
            final TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        @Override
                        public void checkClientTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException {
                        }

                        @Override
                        public void checkServerTrusted(java.security.cert.X509Certificate[] chain, String authType) throws CertificateException {
                        }

                        @Override
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                            return new java.security.cert.X509Certificate[]{};
                        }
                    }
            };

            // 2. Cài đặt SSL Context
            final SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            final SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient.Builder builder = new OkHttpClient.Builder();
            builder.sslSocketFactory(sslSocketFactory, (X509TrustManager) trustAllCerts[0]);

            // 3. Cho phép mọi Hostname (bỏ qua check domain)
            builder.hostnameVerifier(new HostnameVerifier() {
                @Override
                public boolean verify(String hostname, SSLSession session) {
                    return true;
                }
            });

            builder.addInterceptor(loggingInterceptor);

            if (authInterceptor != null) {
                builder.addInterceptor(authInterceptor);
            }

            builder.connectTimeout(TIMEOUT, TimeUnit.SECONDS)
                    .readTimeout(TIMEOUT, TimeUnit.SECONDS)
                    .writeTimeout(TIMEOUT, TimeUnit.SECONDS);

            return builder.build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static Retrofit getClient() {
        if (retrofit == null) {
            // SỬ DỤNG Unsafe Client thay vì Client thường
            OkHttpClient client = getUnsafeOkHttpClient(null);

            retrofit = new Retrofit.Builder()
                    .baseUrl(Constants.BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create(createGson()))
                    .client(client)
                    .build();
        }
        return retrofit;
    }

    public static Retrofit getAuthenticatedClient(Context context) {
        if (authenticatedRetrofit == null) {
            Interceptor authInterceptor = new Interceptor() {
                @Override
                public Response intercept(Chain chain) throws IOException {
                    SharedPreferences prefs = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE);
                    String token = prefs.getString("token", null);

                    Request original = chain.request();
                    Request.Builder requestBuilder = original.newBuilder();

                    if (token != null) {
                        requestBuilder.addHeader("Authorization", "Bearer " + token);
                    }

                    Request request = requestBuilder.build();
                    return chain.proceed(request);
                }
            };

            // SỬ DỤNG Unsafe Client thay vì Client thường
            OkHttpClient client = getUnsafeOkHttpClient(authInterceptor);

            authenticatedRetrofit = new Retrofit.Builder()
                    .baseUrl(Constants.BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create(createGson()))
                    .client(client)
                    .build();
        }
        return authenticatedRetrofit;
    }
}