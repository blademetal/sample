import 'package:flutter/material.dart';
import 'package:test_project/providers/QueryModel.dart';
import 'package:test_project/providers/QueryTypeModel.dart';
import 'package:test_project/screens/QuerySelectionInfoSreen.dart';
import 'package:test_project/widgets/MenuCircleProgressButton.dart';
import 'package:test_project/widgets/common/BaseScreen.dart';
import 'package:test_project/widgets/common/Button.dart';
import 'package:test_project/widgets/common/ScreenTitle.dart';
import 'package:provider/provider.dart';

class BuildProfileScreen extends StatefulWidget {
  const BuildProfileScreen({super.key});

  static const routeName = '/';

  @override
  State<BuildProfileScreen> createState() => _BuildProfileScreenState();
}

class _BuildProfileScreenState extends State<BuildProfileScreen> {
  @override
  Widget build(BuildContext context) {
    QueryModel query = Provider.of<QueryModel>(context);
    QueryTypeModel queryType = Provider.of<QueryTypeModel>(context);

    return BaseScreen(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            const ScreenTitle(
              label: 'Build Your Profile',
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 32),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        for (var item in queryType.typesByRank)
                          MenuCircleProgressButton(
                              progress: query.getProgress(item),
                              label: queryType.queryTypeMap[item]['label'],
                              iconPath: queryType.queryTypeMap[item]
                                  ['iconPath'],
                              isSelected: queryType.selectedType == item,
                              onTap: () => queryType.setSelectQueryType(
                                  queryType.queryTypeMap[item]['name'])),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Center(child: Consumer<QueryTypeModel>(
              builder: (context, queryType, child) {
                return Button(
                  label: "continue",
                  onPressed: queryType.selectedType != null
                      ? () => Navigator.pushNamed(
                          context, QuerySelectionInfoScreen.routeName)
                      : null,
                  fullWidth: true,
                );
              },
            ))
          ],
        ),
      ),
    );
  }
}
