
const { query } = require("../models/querydb");

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('/');
};
exports.createReservation = async (req, res) => {
    try {
        // truyen vao objectid cua room va user qua body
        let { roomId, userId, arrivalDate, departureDate, adults, childs, cost, status } = req.body;
        let error = {};
        let errorCount = 0;

        const arrivalDateGetTime = new Date(arrivalDate).getTime();
        const departureDateGetTime = new Date(departureDate).getTime();

        if (departureDateGetTime - arrivalDateGetTime < 0) {
            error.date = 'Cannot book fewer than 1 days';
            errorCount++;
            return res.status(400).json({ message: "Chọn ngày bắt đầu lớn hơn ngày kết thúc" });
        }

        let currentDate = new Date();
        if (arrivalDateGetTime <= new Date(currentDate.setDate(currentDate.getDate() - 1)).getTime()) {
            return res.status(400).json({ message: "Chọn ngày ở quá khứ" });
        }

        let room = await query(`select * from phong where MaP = ${roomId} && TrangThai = ${1}`)
        if (room.length == 0) {
            return res.status(400).json({ message: "Không tìm thấy phòng" });
        }

        try {
            // if (room[0].SoNguoiToiDa < parseInt(childs) + parseInt(adults)) {
            //     return res.status(200).json({ message: "Đã quá số người tối đa là: " + room[0].SoNguoiToiDa });
            // }
            if (parseInt(childs) + parseInt(adults) === 0) {
                return res.status(400).json({ message: "Không có người ở" });
            }
        } catch (error) {

        }

        let roomList = await query(`select * from ctphieudatphong as ctp, phieudatphong as p where ctp.MaP = ${roomId} and ctp.MaPDP = p.MaPDP`);
        let isFree = true;
        for (var j = 0; j < roomList.length; j++) {
            let startDate = roomList[j].NgayNhanPhong;
            let endDate = roomList[j].NgayTraPhong;
            //lai lai dieu kien if
            const startDateGetTime = new Date(startDate).getTime();
            const endDateGetTime = new Date(endDate).getTime();
            if ((startDateGetTime <= arrivalDateGetTime && endDateGetTime >= arrivalDateGetTime) || (startDateGetTime <= departureDateGetTime && endDateGetTime >= departureDateGetTime)) {
                isFree = false;
                break;
            }
        }
        if (!isFree) {
            error.room = 'Room is not free';
            errorCount++;
            return res.status(400).json({ message: "Phòng không có sẵn" });
        } else {

            let PDPInsert = await query(`insert into phieudatphong set NgayTao = "${new Date().yyyymmdd()}", NgayNhanPhong = "${arrivalDate}", NgayTraPhong = "${departureDate}", TongTien = ${cost}, TrangThai = ${status}, MaKH = ${userId}`)
            await query(`insert into ctphieudatphong set MaPDP = ${PDPInsert.insertId}, MaP = ${roomId}, SoNguoiLon =${adults}, SoTreEm = ${childs}`)

            return res.status(200).json({ message: "Đặt phòng thành công" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

};

const countDateNumber = (beginDate, endDate) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(beginDate);
    const secondDate = new Date(endDate);

    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    return diffDays;
}




exports.updateBills = async (req, res) => {
    try {
        // truyen vao objectid cua room va user qua body
        let { MaPDP, MaP, userId, NgayNhanPhong, NgayTraPhong, adults, childs, GiaThue, status, KhuyenMai } = req.body;
        let error = {};
        let errorCount = 0;
        const roomId = MaP;
        const arrivalDate = NgayNhanPhong;
        const departureDate = NgayTraPhong;
        const arrivalDateGetTime = new Date(arrivalDate).getTime();
        const departureDateGetTime = new Date(departureDate).getTime();

        if (departureDateGetTime - arrivalDateGetTime < 0) {
            error.date = 'Cannot book fewer than 1 days';
            errorCount++;
            return res.status(200).json({ message: "Chọn ngày bắt đầu lớn hơn ngày kết thúc" });
        }

        let currentDate = new Date();
        if (arrivalDateGetTime <= new Date(currentDate.setDate(currentDate.getDate() - 1)).getTime()) {
            return res.status(500).json({ message: "Chọn ngày ở quá khứ" });
        }

        let room = await query(`select * from phong where MaP = ${roomId} && TrangThai = ${1}`)
        if (room.length == 0) {
            return res.status(200).json({ message: "Không tìm thấy phòng" });
        }

        try {
            if (room[0].SoNguoiToiDa < parseInt(childs) + parseInt(adults)) {
                return res.status(200).json({ message: "Đã quá số người tối đa là: " + room[0].SoNguoiToiDa });
            }
            if (parseInt(childs) + parseInt(adults) === 0) {
                return res.status(200).json({ message: "Không có người ở" });
            }
        } catch (error) {

        }

        let roomList = await query(`select * from ctphieudatphong as ctp, phieudatphong as p where ctp.MaP = ${roomId} and ctp.MaPDP = p.MaPDP`);
        let isFree = true;
        for (var j = 0; j < roomList.length; j++) {
            if (roomList[j].MaPDP === MaPDP) {
                continue;
            }
            let startDate = roomList[j].NgayNhanPhong;
            let endDate = roomList[j].NgayTraPhong;
            //lai lai dieu kien if
            const startDateGetTime = new Date(startDate).getTime();
            const endDateGetTime = new Date(endDate).getTime();
            if ((startDateGetTime <= arrivalDateGetTime && endDateGetTime >= arrivalDateGetTime) || (startDateGetTime <= departureDateGetTime && endDateGetTime >= departureDateGetTime)) {
                isFree = false;
                break;
            }
        }
        if (!isFree) {
            error.room = 'Room is not free';
            errorCount++;
            return res.status(200).json({ message: "Phòng không có sẵn" });
        } else {
            let cost;
            let count = countDateNumber(arrivalDate, departureDate);
            count++;
            if(KhuyenMai == undefined || KhuyenMai == '0'){
                cost = parseInt(GiaThue) * count;
            }else{
                cost = parseInt(GiaThue) * count  * (100 - parseInt(KhuyenMai))/100;
            }
            await query(`update phieudatphong set NgayNhanPhong = "${arrivalDate}", NgayTraPhong = "${departureDate}", TongTien = ${cost} where MaPDP = ${MaPDP}`)
            //await query(`insert into ctphieudatphong set MaPDP = ${PDPInsert.insertId}, MaP = ${roomId}, SoNguoiLon =${adults}, SoTreEm = ${childs}`)

            return res.status(200).json({ message: "Cập nhật thành công" });
        }
    } catch (error) {
        res.status(200).json({ message: error.message });
    }

};
