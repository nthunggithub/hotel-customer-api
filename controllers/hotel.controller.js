

const { query } = require("../models/querydb");

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('/');
};

exports.getListRoom = async (req, res) => {
    try {
        //LIMIT 10 OFFSET 15
        let listRooms = await query(`select * from phong where TrangThai = ${1}`)
        return res.status(200).json({ total: listRooms.length, listRooms: listRooms });
    } catch (error) {

    }

};

const isEmpty = value =>
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0);


exports.searchRoom = async (req, res) => {
    try {
        let { arrivalDate, departureDate, beginPrice, endPrice } = req.body;
        let errCount = 0;
        let error = {};
        if (isEmpty(arrivalDate)) {
            errCount++;
            error.arrivalDate = 'No arrival date';
        }
        if (isEmpty(departureDate)) {
            errCount++;
            error.departureDate = 'No departure date';
        }
        if (isEmpty(beginPrice)) {
            errCount++;
            error.beginPrice = 'No beginPrice';
        }
        if (isEmpty(endPrice)) {
            errCount++;
            error.endPrice = 'No endPrice';
        }

        if (errCount) return res.status(500).json({ message :  error.arrivalDate + error.departureDate + error.beginPrice + error.endPrice});

        const arrivalDateGetTime = new Date(arrivalDate).getTime();
        const departureDateGetTime = new Date(departureDate).getTime();

        if (departureDateGetTime - arrivalDateGetTime < 0) {
            return res.status(500).json({ message: "Chọn ngày bắt đầu lớn hơn ngày kết thúc" });
        }
        let currentDate = new Date();
        if(arrivalDateGetTime <= new Date(currentDate.setDate(currentDate.getDate() - 1)).getTime()){
            return res.status(500).json({ message: "Chọn ngày ở quá khứ" });
        }

        let roomList = await query(`select * from phong where GiaThue >= ${beginPrice} && GiaThue <= ${endPrice} && TrangThai = ${1}`)
        let result = [];

        for (var i = 0; i < roomList.length; i++) {
            let isFree = true;
            let PdPListWith1MaP = await query(`select * from ctphieudatphong as ctp, phieudatphong as p where ctp.MaP = ${roomList[i].MaP} and ctp.MaPDP = p.MaPDP`);

            for (var j = 0; j < PdPListWith1MaP.length; j++) {
                let startDateGetTime = PdPListWith1MaP[j].NgayNhanPhong.getTime();
                let endDateGetTime = PdPListWith1MaP[j].NgayTraPhong.getTime();
                if ((startDateGetTime <= arrivalDateGetTime && endDateGetTime >= arrivalDateGetTime) || (startDateGetTime <= departureDateGetTime && endDateGetTime >= departureDateGetTime)) {
                    isFree = false;
                    break;
                }
            }
            if (isFree) result.push(roomList[i]);
        }
        return res.status(200).json({ total: result.length, listRooms: result });
    } catch (error) {
        res.status(500).json({ message: 'Server error when search rooms' });
    }

};

exports.getRoomInfo = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        if (roomId == undefined) {
            res.status(400).json({ message: 'No roomId found' });
            return;
        }
        let room = await query(`select * from phong where MaP = ${roomId}`)
        if (room.length == 0) {
            res.status(404).json({ message: 'Room not found' });
        } else {
            res.status(200).json({ room: room[0] });
        }
    } catch (error) {
        res.status(404).json({ message: error });
    }
};

exports.postcomment = async (req, res) => {
    try {
        await query(`insert into binhluan set NgayBL = "${new Date().yyyymmdd()}", NoiDung = "${req.body.comment}", MaKH = ${req.body.MaKH}, MaP = ${req.body.MaP} `)
        res.status(200).json({ message: "Bình luận thành công" })
    } catch (error) {
        res.status(200).json({ message: "lỗi bình luận" })
    }
}

exports.getcommentlist = async (req, res) => {
    try {
        let data = await query(`select bl.NgayBL, bl.NoiDung, tk.TenTaiKhoan from binhluan as bl, khachang as kh, taikhoan as tk where bl.MaP = ${req.params.id} and bl.MaKH = kh.MaKH and kh.MaTK = tk.MaTK  `)
        res.status(200).json(data);
    } catch (error) {
        res.status(200).json({ message: "lỗi lấy bình luận" })
    }
}

exports.getbills = async (req, res) => {
    try {
        let data = await query(`select p.TenP, pdp.NgayTao, pdp.NgayNhanPhong, pdp.NgayTraPhong, pdp.TongTien, pdp.TrangThai, ctp.SoNguoiLon, ctp.SoTreEm from phieudatphong as pdp, ctphieudatphong as ctp, phong as p where pdp.MaKH = ${req.user.MaKH} and pdp.MaPDP = ctp.MaPDP and ctp.MaP = p.MaP `)
        res.status(200).json(data)
    } catch (error) {
        res.status(200).json({ message: "Lỗi lấy danh sách phiếu đặt phòng" })
    }
}