
const { query } = require("../models/querydb");

exports.createReservation = async (req, res) => {
    try {
        // truyen vao objectid cua room va user qua body
        let { roomId, userId, arrivalDate, departureDate, adults, childs, cost, status } = req.body;
        let error = {};
        let errorCount = 0;

        const arrivalDateGetTime = new Date(arrivalDate).getTime();
        const departureDateGetTime = new Date(departureDate).getTime();

        if (departureDateGetTime - arrivalDateGetTime < 86000) {
            error.date = 'Cannot book fewer than 1 days';
            errorCount++;
            return res.status(400).json({ errorCount: errorCount, error: error });
        }

        if (departureDateGetTime - arrivalDateGetTime > 2592000000) {
            error.date = 'Cannot book more than 30 days';
            errorCount++;
            return res.status(400).json({ errorCount: errorCount, error: error });
        }

        let room = await query(`select * from phong where MaP = ${roomId} `)
        if (room.length == 0) {
            error.roomId = 'Error when find room';
            errorCount++;
            return res.status(400).json({ errorCount: errorCount, error: error });
        }

        let roomList = await query(`select * from ctphieudatphong as ctp, phieudatphong as p where ctp.MaP = ${roomId} and ctp.MaPDP = p.MaPDP`);
        let isFree = true;
        for (var j = 0; j < roomList.length; j++) {
            let startDate = roomList[j].NgayNhanPhong;
            let endDate = roomList[j].NgayTraPhong;
            //lai lai dieu kien if
            if (startDate < departureDate && endDate > arrivalDate) {
                isFree = false;
            }
        }
        if (!isFree) {
            error.room = 'Room is not free';
            errorCount++;
            res.status(400).json({ errorCount: errorCount, error: error });
        } else {

            let PDPInsert = await query(`insert into phieudatphong set NgayTao = "${new Date().toISOString().substring(0,10)}", NgayNhanPhong = "${arrivalDate}", NgayTraPhong = "${departureDate}", TongTien = ${cost}, TrangThai = ${status}, MaKH = ${userId}`)
            await query(`insert into ctphieudatphong set MaPDP = ${PDPInsert.insertId}, MaP = ${roomId}, SoNguoiLon =${adults}, SoTreEm = ${childs}`)

            res.status(200).json({ message: "Đặt phòng thành công" });
        }
    } catch (error) {
        res.status(200).json({ message: error.message });
    }

};
