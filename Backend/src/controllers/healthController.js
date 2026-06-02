exports.getHealth = async (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
};
