const { Patient, Vitals, RiskLog, Emergency, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.count();
    const totalDoctors = await User.count({ where: { role: 'doctor' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alertsToday = await RiskLog.count({
      where: { alert_required: true, timestamp: { [Op.gte]: today } },
    });

    const activeEmergencies = await Emergency.count({ where: { status: 'active' } });

    const riskDistribution = await RiskLog.findAll({
      attributes: ['risk_level', [fn('COUNT', col('id')), 'count']],
      group: ['risk_level'],
      raw: true,
    });

    // Weekly alert trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await RiskLog.count({
        where: { alert_required: true, timestamp: { [Op.gte]: date, [Op.lt]: nextDate } },
      });
      weeklyTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        alerts: count,
      });
    }

    // Recent critical patients
    const recentCritical = await RiskLog.findAll({
      where: { risk_level: { [Op.in]: ['HIGH', 'CRITICAL'] } },
      order: [['timestamp', 'DESC']],
      limit: 5,
      include: [{ model: Patient, attributes: ['name', 'patient_id'] }],
      raw: true,
      nest: true,
    });

    const totalVitalsRecorded = await Vitals.count();

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        alertsToday,
        activeEmergencies,
        totalVitalsRecorded,
        riskDistribution,
        weeklyTrend,
        recentCritical,
      },
    });
  } catch (error) { next(error); }
};
