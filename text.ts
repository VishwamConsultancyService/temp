else if (!matsSuccess && !enumSuccess) {
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        reason: "MTAS and ENUM failed",
        message: "Both MTAS and ENUM operations failed.",
      });
    } else if (!matsSuccess) {
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        reason: "MTAS failed",
        message: "MTAS operation failed, but ENUM succeeded.",
      });
    } else {
      return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        reason: "ENUM failed",
        message: "ENUM operation failed, but MTAS succeeded.",
      });
    }
