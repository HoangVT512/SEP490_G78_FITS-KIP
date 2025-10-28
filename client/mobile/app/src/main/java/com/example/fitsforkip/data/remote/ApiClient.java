package com.example.fitsforkip.data.remote;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.fitsforkip.util.BooleanTypeAdapter;
import com.example.fitsforkip.util.Constants;
import com.example.fitsforkip.util.DateTypeAdapter;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.IOException;
import java.util.Date;
import java.util.concurrent.TimeUnit;

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
        // THÊM DateTypeAdapter
        gsonBuilder.registerTypeAdapter(Date.class, new DateTypeAdapter());
        return gsonBuilder.create();
    }

    public static Retrofit getClient() {
        if (retrofit == null) {
            HttpLoggingInterceptor interceptor = new HttpLoggingInterceptor();
            interceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(interceptor)
                    .connectTimeout(TIMEOUT, TimeUnit.SECONDS)
                    .readTimeout(TIMEOUT, TimeUnit.SECONDS)
                    .writeTimeout(TIMEOUT, TimeUnit.SECONDS)
                    .build();

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
            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

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

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(authInterceptor)
                    .addInterceptor(loggingInterceptor)
                    .connectTimeout(TIMEOUT, TimeUnit.SECONDS)
                    .readTimeout(TIMEOUT, TimeUnit.SECONDS)
                    .writeTimeout(TIMEOUT, TimeUnit.SECONDS)
                    .build();

            authenticatedRetrofit = new Retrofit.Builder()
                    .baseUrl(Constants.BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create(createGson()))
                    .client(client)
                    .build();
        }
        return authenticatedRetrofit;
    }
}
