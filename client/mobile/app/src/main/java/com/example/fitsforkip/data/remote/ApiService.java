package com.example.fitsforkip.data.remote;

import com.example.fitsforkip.data.model.ApiResponse;
import com.example.fitsforkip.data.model.CreateIncidentRequest;
import com.example.fitsforkip.data.model.Equipment;
import com.example.fitsforkip.data.model.IncidentHistory;
import com.example.fitsforkip.data.model.Line;
import com.example.fitsforkip.data.model.MobileLoginRequest;
import com.example.fitsforkip.data.model.MobileLoginResponse;
import com.example.fitsforkip.data.model.IncidentRequestWrapper;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ApiService {
    @GET("api/Lines/public")
    Call<ApiResponse<List<Line>>> getAllLines();

    @POST("api/Auths/mobile-login")
    Call<ApiResponse<MobileLoginResponse>> mobileLogin(@Body MobileLoginRequest request);

    @GET("api/Equipments/by-line/{lineId}")
    Call<ApiResponse<List<Equipment>>> getEquipmentsByLine(@Header("Authorization") String authHeader, @Path("lineId") int lineId);

    @POST("api/Incidents")
    Call<ApiResponse<IncidentHistory>> createIncident(@Header("Authorization") String authHeader, @Body CreateIncidentRequest request);
}
