# Nguyễn Như Khiêm - K225480106030
# Bài tập 02: Lập trình web.  
# NGÀY GIAO: 19/10/2025  
# DEADLINE: 26/10/2025  
---
# Mục lục
**1. Giới thiệu  
2. Nội dung bài tập  
3. Cài đặt và cấu hình Apache  
4. Cài đặt và cấu hình nodejs, Node-RED  
5. Tạo CSDL (schema + sample data)  
6. Test API (curl / browser)  
7. Frontend (index.html, js, css)  
8. Kết luận & tự đánh giá**  

---
# 1. Giới thiệu
## 1.1. Giới thiệu chung
Trong bối cảnh phát triển mạnh mẽ của Internet of Things (IoT) và các hệ thống web động, Node-RED là một nền tảng lập trình trực quan dựa trên dòng dữ liệu (flow-based programming) giúp người dùng dễ dàng kết nối các thiết bị, xử lý dữ liệu và tương tác với cơ sở dữ liệu hoặc dịch vụ web mà không cần viết quá nhiều mã phức tạp.
Dự án này được thực hiện nhằm xây dựng quy trình xử lý và cập nhật dữ liệu sản phẩm (bao gồm thông tin và hình ảnh) thông qua Node-RED. Hệ thống cho phép người dùng gửi yêu cầu cập nhật sản phẩm, lưu hình ảnh mới vào thư mục máy chủ, và thực hiện câu lệnh SQL UPDATE trên SQL Server để thay đổi dữ liệu tương ứng trong bảng SanPham.

## 1.2. Mục tiêu của hệ thống
**Mục tiêu của bài là:**
- Xây dựng luồng xử lý (flow) trên Node-RED cho phép nhận dữ liệu từ người dùng hoặc API.
- Kiểm tra và lưu hình ảnh sản phẩm vào thư mục trên máy chủ (ví dụ: D:\Apache\Apache24\nguyennhukhiem\images\).
- Chuẩn bị và thực thi câu lệnh SQL UPDATE để cập nhật các trường như TenSP, GiaSP, MoTa, HinhAnh... trong cơ sở dữ liệu.
- Kiểm tra lỗi, xử lý ngoại lệ và phản hồi lại cho người dùng (ví dụ: thông báo “Cập nhật thành công” hoặc “Lỗi thiếu dữ liệu”).

## 1.3. Công cụ và công nghệ sử dụng
1. Node-RED: Xây dựng luồng xử lý và logic nghiệp vụ.
2. SQL Server 2022: Lưu trữ dữ liệu sản phẩm.
3. Apache Server: Lưu trữ hình ảnh (thư mục public).
4. JavaScript (Node-RED Function node): Xử lý logic cập nhật, kiểm tra dữ liệu, chuẩn bị câu lệnh SQL.
5. HTTP Request/Response nodes: Tiếp nhận và phản hồi yêu cầu từ giao diện hoặc API.

## 1.4. Ý nghĩa
Việc sử dụng Node-RED giúp:
- Đơn giản hóa quy trình lập trình backend nhờ giao diện kéo thả trực quan.
- Tăng tốc phát triển hệ thống, phù hợp cho sinh viên và người mới học IoT/Web backend.
Dễ bảo trì và mở rộng, có thể thêm nhiều chức năng như thêm sản phẩm, xóa sản phẩm, hoặc thống kê dữ liệu mà không cần thay đổi nhiều mã nguồn.

---
# 2. Nội dung bài tập:
## 2.1. Cài đặt Apache web server:
- Vô hiệu hoá IIS: nếu iis đang chạy thì mở cmd quyền admin để chạy lệnh: iisreset /stop
- Download apache server, giải nén ra ổ D, cấu hình các file:
  + D:\Apache24\conf\httpd.conf
  + D:Apache24\conf\extra\httpd-vhosts.conf
  để tạo website với domain: fullname.com
  code web sẽ đặt tại thư mục: `D:\Apache24\fullname` (fullname ko dấu, liền nhau)
- sử dụng file `c:\WINDOWS\SYSTEM32\Drivers\etc\hosts` để fake ip 127.0.0.1 cho domain này
  ví dụ sv tên là: `Đỗ Duy Cốp` thì tạo website với domain là fullname ko dấu, liền nhau: `doduycop.com`
- thao tác dòng lệnh trên file `D:\Apache24\bin\httpd.exe` với các tham số `-k install` và `-k start` để cài đặt và khởi động web server apache.  
## 2.2. Cài đặt nodejs và nodered => Dùng làm backend:
- Cài đặt nodejs:
  + download file `https://nodejs.org/dist/v20.19.5/node-v20.19.5-x64.msi`  (đây ko phải bản mới nhất, nhưng ổn định)
  + cài đặt vào thư mục `D:\nodejs`
- Cài đặt nodered:
  + chạy cmd, vào thư mục `D:\nodejs`, chạy lệnh `npm install -g --unsafe-perm node-red --prefix "D:\nodejs\nodered"`
  + download file: https://nssm.cc/release/nssm-2.24.zip
    giải nén được file nssm.exe
    copy nssm.exe vào thư mục `D:\nodejs\nodered\`
  + tạo file "D:\nodejs\nodered\run-nodered.cmd" với nội dung (5 dòng sau):  
```
@echo off
REM fix path
set PATH=D:\nodejs;%PATH%
REM Run Node-RED
node "D:\nodejs\nodered\node_modules\node-red\red.js" -u "D:\nodejs\nodered\work" %*
```
  + mở cmd, chuyển đến thư mục: `D:\nodejs\nodered`
  + cài đặt service `a1-nodered` bằng lệnh: nssm.exe install a1-nodered "D:\nodejs\nodered\run-nodered.cmd"
  + chạy service `a1-nodered` bằng lệnh: `nssm start a1-nodered`

## 2.3. Tạo csdl tuỳ ý trên mssql (sql server 2022), nhớ các thông số kết nối: ip, port, username, password, db_name, table_name
## 2.4. Cài đặt thư viện trên nodered:
- truy cập giao diện nodered bằng url: http://localhost:1880
- cài đặt các thư viện: node-red-contrib-mssql-plus, node-red-node-mysql, node-red-contrib-telegrambot, node-red-contrib-moment, node-red-contrib-influxdb, node-red-contrib-duckdns, node-red-contrib-cron-plus
- Sửa file `D:\nodejs\nodered\work\settings.js` : 
  tìm đến chỗ adminAuth, bỏ comment # ở đầu dòng (8 dòng), thay chuỗi mã hoá mật khẩu bằng chuỗi mới
  ```
  adminAuth: {
        type: "credentials",
        users: [{
            username: "admin",
            password: "chuỗi_mã_hoá_mật_khẩu",
            permissions: "*"
        }]
    },
  ```
   với mã hoá mật khẩu có thể thiết lập bằng tool: https://tms.tnut.edu.vn/pw.php
- chạy lại nodered bằng cách: mở cmd, vào thư mục `D:\nodejs\nodered` và chạy lệnh `nssm restart a1-nodered`
  khi đó nodered sẽ yêu cầu nhập mật khẩu mới vào được giao diện cho admin tại: http://localhost:1880  

## 2.5. tạo api back-end bằng nodered:
- tại flow1 trên nodered, sử dụng node `http in` và `http response` để tạo api
- thêm node `MSSQL` để truy vấn tới cơ sở dữ liệu
- logic flow sẽ gồm 4 node theo thứ tự sau (thứ tự nối dây): 
  1. http in  : dùng GET cho đơn giản, URL đặt tuỳ ý, ví dụ: /timkiem
  2. function : để tiền xử lý dữ liệu gửi đến
  3. MSSQL: để truy vấn dữ liệu tới CSDL, nhận tham số từ node tiền xử lý
  4. http response: để phản hồi dữ liệu về client: Status Code=200, Header add : Content-Type = application/json
  có thể thêm node `debug` để quan sát giá trị trung gian.
- test api thông qua trình duyệt, ví dụ: http://localhost:1880/timkiem?q=thị  

## 2.6. Tạo giao diện front-end:
- html form gồm các file : index.html, fullname.js, fullname.css
  cả 3 file này đặt trong thư mục: `D:\Apache24\fullname`
  nhớ thay fullname là tên của bạn, viết liền, ko dấu, chữ thường, vd tên là Đỗ Duy Cốp thì fullname là `doduycop`
  khi đó 3 file sẽ là: index.html, doduycop.js và doduycop.css
- index.html và fullname.css: trang trí tuỳ ý, có dấu ấn cá nhân, có form nhập được thông tin.
- fullname.js: lấy dữ liệu trên form, gửi đến api nodered đã làm ở bước 2.5, nhận về json, dùng json trả về để tạo giao diện phù hợp với kết quả truy vấn của bạn.

## 2.7. Nhận xét bài làm của mình:
- đã hiểu quá trình cài đặt các phần mềm và các thư viện như nào?
- đã hiểu cách sử dụng nodered để tạo api back-end như nào?
- đã hiểu cách frond-end tương tác với back-end ra sao?
---
# TIÊU CHÍ CHẤM ĐIỂM:
1. y/c bắt buộc về thời gian: ko quá Deadline, quá: 0 điểm (ko có ngoại lệ)
2. cài đặt được apache và nodejs và nodered: 1đ
3. cài đặt được các thư viện của nodered: 1đ
4. nhập dữ liệu demo vào sql-server: 1đ
5. tạo được back-end api trên nodered, test qua url thành công: 1đ
6. tạo được front-end html css js, gọi được api, hiển thị kq: 1đ
7. trình bày độ hiểu về toàn bộ quá trình (mục 2.7): 5đ
---
# GHI CHÚ:
1. yêu cầu trên cài đặt trên ổ D, nếu máy ko có ổ D có thể linh hoạt chuyển sang ổ khác, path khác.
2. có thể thực hiện trực tiếp trên máy tính windows, hoặc máy ảo
3. vì csdl là tuỳ ý: sv cần mô tả rõ db chứa dữ liệu gì, nhập nhiều dữ liệu test có nghĩa, json trả về sẽ có dạng như nào cũng cần mô tả rõ.
4. có thể xây dựng nhiều API cùng cơ chế, khác tính năng: như tìm kiếm, thêm, sửa, xoá dữ liệu trong DB.
5. bài làm phải có dấu ấn cá nhân, nghiêm cấm mọi hình thức sao chép, gian lận (sẽ cấm thi nếu bị phát hiện gian lận).
6. bài tập thực làm sẽ tốn nhiều thời gian, sv cần chứng minh quá trình làm: save file `readme.md` mỗi khoảng 15-30 phút làm : lịch sử sửa đổi sẽ thấy quá trình làm này!
7. nhắc nhẹ: github ko fake datetime được.
8. sv được sử dụng AI để tham khảo.
---
# 3. Cài đặt Apache
## Bước 1: Cài đặt Apcahe cho windows
**Download tại : https://www.apachelounge.com/download/**  
Tải phiên bản phù hợp. Vd : httpd-2.4.65-250724-Win64-VS17.zip  

## Bước 2. Giải nén Apache 
Tạo thư mục và giải nén tại D:Apache\Apache24

## Bước 3 : Cấu hình Apache
Để tạo Website với Domain : nguyennhukhiem.com , tạo domain cục bộ
### 1. Thêm dòng vào C:\Windows\System32\drivers\etc\hosts:
- 127.0.0.1 nguyennhukhiem.com
### 2. Tạo 1 thư mục chứa web tại D:\Apache\Apache24\nguyennhukhiem
- Tạo 1 file index.html trong thư mực nguyennhukhiem
### 3. Sửa Define SRVROOT trong D:\Apache24\conf\httpd.conf:  
- Sửa thành đường dẫn đến thư mục đang đặt Apche24 : Define SRVROOT "d:/Apache/Apache24"
- Bỏ dấu # ở : LoadModule vhost_alias_module modules/mod_vhost_alias.so và Include conf/extra/httpd-vhosts.conf

### 4. Thêm vhost trong extra/httpd-vhosts.conf:
Trong <VirtualHost *:80>
- Thay DocumentRoot bằng đường dẫn chứ thư mục web
- Đổi tên ServerName
```
<VirtualHost *:80>
    ServerAdmin webmaster@dummy-host.example.com
    DocumentRoot "D:\Apache\Apache24\nguyennhukhiem"
    ServerName nguyennhukhiem.com
    ServerAlias www.dummy-host.example.com
    ErrorLog "logs/dummy-web-error.log"
    CustomLog "logs/dummy-web-access.log" common
    <Directory "D:\Apache\Apache24\nguyennhukhiem">
    	 Options Indexes FollowSymLinks
   	 AllowOverride None
   	 Require all granted
    </Directory>
</VirtualHost>
```

## Bước 4 : Chạy Apache
<img width="1086" height="107" alt="Screenshot 2025-10-22 002638" src="https://github.com/user-attachments/assets/e1b356bc-059d-4ce9-99e3-b29869b6c1a3" />

## Kết quả
<img width="1908" height="814" alt="image" src="https://github.com/user-attachments/assets/8bf3a9f3-f79c-49af-bf89-7a3b21834cbd" />  
Đã chạy web trên Apcahe thành công

---
# 4. Cài đặt và cấu hình nodejs, Node-RED  
## Bước 1 : Cài đặt nodejs:
+ Download file tại : https://nodejs.org/dist/v22.21.0/node-v22.21.0-x64.msi
+ Cài đặt vào thư mục `D:\nodejs`
## Bước 2: Cài đặt nodered:
+ Chạy cmd, vào thư mục `D:\nodejs`, chạy lệnh `npm install -g --unsafe-perm node-red --prefix "D:\nodejs\nodered"`  
<img width="938" height="180" alt="image" src="https://github.com/user-attachments/assets/c5999592-1298-4ec2-9ec0-6c6544489beb" />  

+ Download file: https://nssm.cc/release/nssm-2.24.zip giải nén được file nssm.exe
+ Copy nssm.exe vào thư mục `D:\nodejs\nodered\`
+ Tạo file "D:\nodejs\nodered\run-nodered.cmd" với nội dung (5 dòng sau):
```
@echo off
REM fix path
set PATH=D:\nodejs;%PATH%
REM Run Node-RED
node "D:\nodejs\nodered\node_modules\node-red\red.js" -u "D:\nodejs\nodered\work" %*
```
<img width="1007" height="444" alt="image" src="https://github.com/user-attachments/assets/cdecc733-900f-4839-843f-88787dd70efe" />  

## Bước 3 : Chạy Node-Red
+ Mở cmd với quyền Admin, chuyển đến thư mục: `D:\nodejs\nodered`
+ Cài đặt service `a1-nodered` bằng lệnh: nssm.exe install a1-nodered "D:\nodejs\nodered\run-nodered.cmd"  
<img width="938" height="180" alt="Screenshot 2025-10-22 202420" src="https://github.com/user-attachments/assets/4e5442f5-d6e9-4f9d-a77d-4e930c68be96" />

+ Chạy service `a1-nodered` bằng lệnh: `nssm start a1-nodered`  

<img width="604" height="92" alt="Screenshot 2025-10-22 202617" src="https://github.com/user-attachments/assets/73f3661f-6aa0-42e8-994e-ed17ad6c4c3e" />  

**Node-Red sẽ chạy ở http://localhost:1880**  

<img width="1837" height="920" alt="image" src="https://github.com/user-attachments/assets/bcf612de-e543-4caa-afab-ecdf9ca23eb0" />  

## Cài đặt các thư viện cần thiết
```
node-red-contrib-mssql-plus
node-red-node-mysql
node-red-contrib-telegrambot
node-red-contrib-moment
node-red-contrib-influxdb
node-red-contrib-duckdns
node-red-contrib-cron-plus
```
<img width="768" height="829" alt="image" src="https://github.com/user-attachments/assets/ee1c1fd6-28f7-431c-aa26-ef9cea9fa53c" />

## Bước 4 : Cài đặt mật khẩu cho Node-Red
- Sửa file `D:\nodejs\nodered\work\settings.js` : 
  tìm đến chỗ adminAuth, bỏ comment # ở đầu dòng (8 dòng), thay chuỗi mã hoá mật khẩu bằng chuỗi mới
```
  adminAuth: {
        type: "credentials",
        users: [{
        username: "admin",
            password: "chuỗi_mã_hoá_mật_khẩu",
            permissions: "*"
        }]
    },
```
   với mã hoá mật khẩu có thể thiết lập bằng tool: https://tms.tnut.edu.vn/pw.php  

<img width="1122" height="443" alt="image" src="https://github.com/user-attachments/assets/21db3acc-8d5a-4b7b-9b36-9de8eb7d04e6" />  

- Sau đó chạy lại nodered bằng cách: mở cmd, vào thư mục `D:\nodejs\nodered` và chạy lệnh `nssm restart a1-nodered`  

<img width="540" height="181" alt="image" src="https://github.com/user-attachments/assets/cc82e2bc-6d91-486b-a457-a1de89a183f8" />  

- Khi đó nodered sẽ yêu cầu nhập mật khẩu mới vào được giao diện cho admin tại: http://localhost:1880  
<img width="1850" height="1016" alt="image" src="https://github.com/user-attachments/assets/d8b0fade-66d6-4d42-a25c-8f5eb554ad93" />

# 5. Tạo CSDL (schema + sample data)  
- Cơ sở dữ liệu được thiết kế nhằm lưu trữ và quản lý thông tin sản phẩm trong hệ thống.
- Hệ thống này mô phỏng một cửa hàng trực tuyến (online store), trong đó mỗi sản phẩm có các thông tin cơ bản như tên, loại, giá, mô tả, số lượng và hình ảnh minh họa.
### Tạo DB name : QL_Shop  
### Table name : SanPham  
### Server name : NguyenNhuKhiem\KHIEM_SQL2022
### Port : 1433
<img width="739" height="357" alt="image" src="https://github.com/user-attachments/assets/8438a5e2-ae88-4d54-a31f-7865b156edd9" />  

### Dữ liệu mẫu :  
<img width="1462" height="752" alt="image" src="https://github.com/user-attachments/assets/7219db9f-778c-404c-b061-99c17e0b682d" />  

# 6. Test API (curl / browser)  
## API Truy vấn tìm kiếm sản phẩm 
- Tại flow1 trên nodered, sử dụng node `http in` và `http response` để tạo api
- Thêm node `MSSQL` để truy vấn tới cơ sở dữ liệu
- logic flow sẽ gồm 4 node theo thứ tự sau: 
### Bước 1: Thêm http in  : dùng GET , URL đặt tuỳ ý, ví dụ: /timkiem
<img width="635" height="350" alt="image" src="https://github.com/user-attachments/assets/38e22fe6-e648-4f3f-ab1c-000aab15bdd1" />  

### Bước 2: Thêm node function : để tiền xử lý dữ liệu gửi đến
<img width="802" height="438" alt="image" src="https://github.com/user-attachments/assets/58728e5d-ee8c-438c-929a-3ccc478def8e" />  

### Bước 3: Thêm node MSSQL: để truy vấn dữ liệu tới CSDL, nhận tham số từ node tiền xử lý
<img width="644" height="615" alt="image" src="https://github.com/user-attachments/assets/3ac0923e-e5cf-4702-8abd-93820ad14e33" />  
<img width="619" height="766" alt="image" src="https://github.com/user-attachments/assets/483543aa-815b-4777-9687-7905619fe938" />  

### Bước 4: Thêm node http response: để phản hồi dữ liệu về client: Status Code=200, Header add : Content-Type = application/json
<img width="632" height="439" alt="image" src="https://github.com/user-attachments/assets/e2bef361-ee60-4711-abe2-dd087a030c38" />

### Bước 5: Thêm node `debug` để quan sát giá trị trung gian.
<img width="632" height="436" alt="image" src="https://github.com/user-attachments/assets/d77e450b-8b3e-4ff4-808e-3b791ea45355" />  

## Kết quả
<img width="1544" height="295" alt="image" src="https://github.com/user-attachments/assets/822b30c8-a235-4a86-9fb2-0835d5d494c7" />

### Test API : Tìm kiếm sản phẩm 
- **Ví dụ : tìm kiếm bánh** http://localhost:1880/timkiem?q=bánh
<img width="759" height="905" alt="image" src="https://github.com/user-attachments/assets/ea09708d-376b-4c34-9f87-f8364202e459" />  

Ta có thể thấy khi tìm kiếm từ 'bánh' có thể tìm thấy 3 sản phẩm được phản hồi về client dưới dạng json.  

- **Quan sát trong debug cũng có 3 sản phẩm đã tìm thấy**
<img width="390" height="771" alt="image" src="https://github.com/user-attachments/assets/630ed936-caf8-4320-a31e-6974f8b27dfa" />

Như vậy đã API tìm kiếm đã hoạt động thành công.

## API Thêm sản phẩm
- Dùng Method : POST
<img width="1798" height="333" alt="image" src="https://github.com/user-attachments/assets/dc90abb6-3585-47b2-98a3-9edb5b9b06a1" />

### Test API Thêm sản phẩm
- Thêm 1 node Inject với nội dung json để thêm sản phẩm
<img width="656" height="273" alt="image" src="https://github.com/user-attachments/assets/a5d84c5e-e8ec-4d6e-9567-785dde3fce19" />

```
{
    "TenSP": "Bút bi Thiên Long",
    "LoaiSP": "Văn phòng phẩm",
    "Gia": 50003,
    "SoLuong": 2040,
    "MoTa": "Bút bi mực xanh, đầu nhỏ, viết mượt",
    "HinhAnh": null
}
```
### Kết quả :
- Trong Debug

<img width="480" height="401" alt="image" src="https://github.com/user-attachments/assets/9159d0b3-e232-46df-8b25-38ae54207954" />

- Test API bằng Postman

<img width="1281" height="613" alt="image" src="https://github.com/user-attachments/assets/33b7fb5e-4d79-48af-94da-71e3f403cc12" />  

- Trong SQL cũng đã thêm thành công

<img width="1520" height="129" alt="image" src="https://github.com/user-attachments/assets/02eff09a-bdc5-4090-9c14-01cbc932eeec" />  

## API Sửa sản phẩm
- Dùng Method : PUT
<img width="1709" height="276" alt="image" src="https://github.com/user-attachments/assets/328d2bcc-6b87-4ed1-9a3d-7fb367af622e" />

## API Xoá sản phẩm
- Dùng Method : DELETE
<img width="1615" height="298" alt="image" src="https://github.com/user-attachments/assets/6316185f-b03c-4379-85c4-fce4a83a79f9" />









